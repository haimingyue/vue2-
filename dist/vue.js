(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
}(this, (function () { 'use strict';

  function _typeof(obj) {
    "@babel/helpers - typeof";

    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function isFunction(val) {
    return typeof val === 'function';
  }
  function isObject(val) {
    return _typeof(val) === 'object' && val != null;
  }
  var callbacks = [];

  function flushCallbacks() {
    callbacks.forEach(function (cb) {
      return cb();
    });
    waiting = false;
  }

  var waiting = false;

  function timer(flushCallbacks) {
    var timerFn = function timerFn() {};

    if (Promise) {
      timerFn = function timerFn() {
        Promise.resolve().then(flushCallbacks);
      };
    } else if (MutationObserver) {
      // 这个也是微任务
      var textNode = document.createTextNode(1);
      var observe = new MutationObserver(flushCallbacks);
      observe.observe(textNode, {
        characterData: true
      });

      timerFn = function timerFn() {
        textNode.textContent = 3;
      };
    } else if (setImmediate) {
      timerFn = function timerFn() {
        setImmediate(flushCallbacks);
      };
    } else {
      timerFn = function timerFn() {
        setTimeout(flushCallbacks, 0);
      };
    }

    timerFn();
  }

  function nextTick(cb) {
    callbacks.push(cb); // 先修改数据 flush(先执行) / 后用户调用vm.$nextTick(后)

    if (!waiting) {
      timer(flushCallbacks);
      waiting = true;
    }
  }

  var oldArrayPrototype = Array.prototype;
  var arrayMethods = Object.create(oldArrayPrototype); // arrayMethods.__proto__ = Array.prototype 继承

  var methods = ['shift', 'unshift', 'pop', 'push', 'splice', 'reverse', 'sort']; // 改写的用自己的，没有改写的用原来的。

  methods.forEach(function (method) {
    arrayMethods[method] = function () {
      var _oldArrayPrototype$me;

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      // 这里的args是传入的参数列表
      // 比如arr.push(1,2,3),则 ...args = [1, 2, 3]
      (_oldArrayPrototype$me = oldArrayPrototype[method]).call.apply(_oldArrayPrototype$me, [this].concat(args));

      var inserted;
      var ob = this.__ob__;

      switch (method) {
        case 'push':
        case 'unshift':
          inserted = args;
          break;

        case 'splice':
          inserted = args.slice(2);
      }

      if (inserted) {
        // 如果有新增的值，就继续劫持，这里要观测的是数组的每一项
        ob.observeArray(inserted);
      } // console.log('obbbbb', ob)


      ob.dep.notify();
    };
  });

  // 一个属性对应一个dep，做属性收集
  var id$1 = 0;

  var Dep = /*#__PURE__*/function () {
    // 每一个属性都分配一个Dep，每一个Dep可以存放watcher，watch中要存放Dep
    function Dep() {
      _classCallCheck(this, Dep);

      this.id = id$1++;
      this.subs = []; // 用来存放watcher
    }

    _createClass(Dep, [{
      key: "depend",
      value: function depend() {
        // Dep.target dep里面要存放这个watcher watcher一样要存放dep
        if (Dep.target) {
          // 把dep给watcher，让watcher存放dep
          Dep.target.addDep(this);
        }
      }
    }, {
      key: "addSub",
      value: function addSub(watcher) {
        this.subs.push(watcher);
      }
    }, {
      key: "notify",
      value: function notify() {
        this.subs.forEach(function (watcher) {
          watcher.update();
        });
      }
    }]);

    return Dep;
  }();

  Dep.target = null;
  function pushTarget(watcher) {
    Dep.target = watcher;
  }
  function popTarget() {
    Dep.target = null;
  }

  var Observer = /*#__PURE__*/function () {
    function Observer(data) {
      _classCallCheck(this, Observer);

      this.dep = new Dep(); // 给当前的数组添加一个属性，当前的observer的实例
      // data.__ob__ = this
      // 这里用__ob__会出现死循环，因为会不停的执行defineReactive

      Object.defineProperty(data, '__ob__', {
        value: this,
        enumerable: false // 不可枚举

      }); // 对对象中的所有属性进行劫持

      if (Array.isArray(data)) {
        // 切片编程（高阶函数），改写原来的数组
        // 用户调用时：如果调用的是“劫持”的七个变异方法，就用自己重写的，否则调用原来的。
        data.__proto__ = arrayMethods; // 如果数组里面是对象的话，需要对对象进行监控

        this.observeArray(data);
      } else {
        this.walk(data);
      }
    }

    _createClass(Observer, [{
      key: "observeArray",
      value: function observeArray(data) {
        // 遍历data
        data.forEach(function (item) {
          // 对item进行观测
          // 对数组里面的数组和对象进行监控
          observe(item);
        });
      }
    }, {
      key: "walk",
      value: function walk(data) {
        Object.keys(data).forEach(function (key) {
          // 把对象中的所有的属性定义成响应式的
          defineReactive(data, key, data[key]);
        });
      }
    }]);

    return Observer;
  }();

  function dependArray(value) {
    for (var i = 0; i < value.length; i++) {
      var current = value[i]; // current 是数组里面的数组

      console.log('current', current);
      current.__ob__ && current.__ob__.dep.depend();

      if (Array.isArray(current)) {
        dependArray(current);
      }
    }
  } // vue2为什么性能低？
  // 因为Vue2会对对象进行遍历，将每个属性用defineProperty重新定义（全量劫持）


  function defineReactive(data, key, value) {
    // value 有可能是对象（对象套对象），递归劫持
    var childOb = observe(value);
    var dep = new Dep(); // console.log('childOb', childOb)

    Object.defineProperty(data, key, {
      get: function get() {
        // console.log('key', key)
        // 取值时候我希望将watcher和Dep关联起来
        // 但是这里没有watcher
        if (Dep.target) {
          // 说明这个get是在模板中使用的
          // 让dep记住watcher，依赖收集,它是一个依赖收集器 
          dep.depend(); // console.log(childOb)

          if (childOb) {
            // childOb可能是数组，也可能是对象，对象也要收集，后续写$set的时候需要用到它自己的更新操作
            childOb.dep.depend(); // 让数组和对象也记录watcher

            if (Array.isArray(value)) {
              dependArray(value);
            }
          }
        }

        return value;
      },
      set: function set(newV) {
        if (newV !== value) {
          observe(newV); // 如果用户赋值的是一个新对象，需要将这个对象进行劫持

          value = newV;
          dep.notify(); // 通知当前的属性存放的watcher执行
        }
      }
    });
  }

  function observe(data) {
    if (!isObject(data)) {
      return;
    }

    if (data.__ob__) {
      return data.__ob__;
    }

    return new Observer(data);
  }

  /**
   * 
   * @param {Vue的实例} vm 
   * initState 说明：
   * 对Vue的数据进行初始化
   * Vue的数据来源有：data，computed，watch，props，inject...
   */

  function initState(vm) {
    var opts = vm.$options;

    if (opts.data) {
      // 对数据进行处理
      initData(vm);
    } // if (opts.computed) {
    //     // 对数据进行处理
    //     initComputed()
    // }
    // if (opts.watch) {
    //     // 对数据进行处理
    //     initWatch()
    // }

  }

  function initData(vm) {
    // 用户设置$开头的属性，Vue内部不会进行代理
    var data = vm.$options.data; // vue2中，会将data中的所有数据，进行数据劫持（Object.defineProperty）
    // 如果data是函数，取返回值，否则去data本身
    // 如果是方法的话，我这里希望方法里面的this都指向VM
    // 通过_data对data 和 vm进行关联

    data = vm._data = isFunction(data) ? data.call(vm) : data;

    for (var key in data) {
      proxy(vm, '_data', key);
    } // 对数据进行观测


    observe(data);
  }

  function proxy(vm, source, key) {
    Object.defineProperty(vm, key, {
      get: function get() {
        return vm[source][key];
      },
      set: function set(newValue) {
        vm[source][key] = newValue;
      }
    });
  }

  var ncname = "[a-zA-Z_][\\-\\.0-9_a-zA-Z]*"; // 标签名 

  var qnameCapture = "((?:".concat(ncname, "\\:)?").concat(ncname, ")"); //  用来获取的标签名的 match后的索引为1的

  var startTagOpen = new RegExp("^<".concat(qnameCapture)); // 匹配开始标签的 

  var endTag = new RegExp("^<\\/".concat(qnameCapture, "[^>]*>")); // 匹配闭合标签的
  //           aa  =   "  xxx "  | '  xxxx '  | xxx

  var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // a=b  a="b"  a='b'

  var startTagClose = /^\s*(\/?)>/; //     />   <div/>
  // const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g; // {{aaaaa}}
  // ast (语法层面的描述 js css html) vdom （dom节点）
  // html字符串解析成 对应的脚本来触发 tokens  <div id="app"> {{name}}</div>
  // 将解析后的结果 组装成一个树结构  栈

  function createAstElement(tagName, attrs) {
    return {
      tag: tagName,
      type: 1,
      children: [],
      parent: null,
      attrs: attrs
    };
  }

  var root = null;
  var stack = [];

  function start(tagName, attributes) {
    var parent = stack[stack.length - 1];
    var element = createAstElement(tagName, attributes);

    if (!root) {
      root = element;
    }

    if (parent) {
      element.parent = parent; // 当放入栈中时 继续父亲是谁

      parent.children.push(element);
    }

    stack.push(element);
  }

  function end(tagName) {
    var last = stack.pop();

    if (last.tag !== tagName) {
      throw new Error('标签有误');
    }
  }

  function chars(text) {
    text = text.replace(/\s/g, "");
    var parent = stack[stack.length - 1];

    if (text) {
      parent.children.push({
        type: 3,
        text: text
      });
    }
  }

  function parserHTML(html) {
    function advance(len) {
      html = html.substring(len);
    }

    function parseStartTag() {
      var start = html.match(startTagOpen);

      if (start) {
        var match = {
          tagName: start[1],
          attrs: []
        };
        advance(start[0].length);

        var _end; // 如果没有遇到标签结尾就不停的解析


        var attr;

        while (!(_end = html.match(startTagClose)) && (attr = html.match(attribute))) {
          match.attrs.push({
            name: attr[1],
            value: attr[3] || attr[4] || attr[5]
          });
          advance(attr[0].length);
        }

        if (_end) {
          advance(_end[0].length);
        }

        return match;
      }

      return false; // 不是开始标签
    }

    while (html) {
      // 看要解析的内容是否存在，如果存在就不停的解析
      var textEnd = html.indexOf('<'); // 当前解析的开头  

      if (textEnd == 0) {
        var startTagMatch = parseStartTag(); // 解析开始标签

        if (startTagMatch) {
          start(startTagMatch.tagName, startTagMatch.attrs);
          continue;
        }

        var endTagMatch = html.match(endTag);

        if (endTagMatch) {
          end(endTagMatch[1]);
          advance(endTagMatch[0].length);
          continue;
        }
      }

      var text = void 0; // //  </div>

      if (textEnd > 0) {
        text = html.substring(0, textEnd);
      }

      if (text) {
        chars(text);
        advance(text.length);
      }
    }

    return root;
  } // 看一下用户是否传入了 , 没传入可能传入的是 template, template如果也没有传递
  // 将我们的html =》 词法解析  （开始标签 ， 结束标签，属性，文本）
  // => ast语法树 用来描述html语法的 stack=[]
  // codegen  <div>hello</div>  =>   _c('div',{},'hello')  => 让字符串执行
  // 字符串如果转成代码 eval 好性能 会有作用域问题
  // 模板引擎 new Function + with 来实现

  var defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g; // {{aaaaa}}

  function genProps(attrs) {
    var str = '';

    for (var i = 0; i < attrs.length; i++) {
      var attr = attrs[i];

      if (attr.name === 'style') {
        (function () {
          var styleObj = {};
          attr.value.replace(/([^:;]+):([^:;]+)/g, function () {
            styleObj[arguments[1]] = arguments[2];
          });
          attr.value = styleObj;
        })();
      }

      str += "".concat(attr.name, ":").concat(JSON.stringify(attr.value), ",");
    }

    return "{".concat(str.slice(0, -1), "}");
  }

  function gen(el) {
    var text = el.text;

    if (el.type === 1) {
      // element: 1 text: 3
      return generate(el);
    } else {
      if (!defaultTagRE.test(text)) {
        return "_v('".concat(text, "')");
      } else {
        // 拆分
        var tokens = [];
        var match;
        var lastIndex = defaultTagRE.lastIndex = 0;

        while (match = defaultTagRE.exec(text)) {
          // 看有没有匹配到
          var index = match.index; // 开始索引

          if (index > lastIndex) {
            tokens.push(JSON.stringify(text.slice(lastIndex, index)));
          }

          tokens.push("_s(".concat(match[1].trim(), ")"));
          lastIndex = index + match[0].length;
        }

        if (lastIndex < text.length) {
          tokens.push(JSON.stringify(text.slice(lastIndex)));
        }

        return "_v(".concat(tokens.join('+'), ")");
      }
    }
  }

  function genChildren(el) {
    var children = el.children; // 获取儿子

    if (children) {
      return children.map(function (c) {
        return gen(c);
      }).join(',');
    }

    return false;
  }

  function generate(el) {
    var children = genChildren(el); // 遍历🌲，将🌲拼接成字符串

    var code = "_c('".concat(el.tag, "', ").concat(el.attrs.length ? genProps(el.attrs) : 'undefined').concat(children ? ",".concat(children) : '', ")");
    return code;
  }

  function compileToFunction(template) {
    var root = parserHTML(template); // ast （只能描述语法）=> render => 虚拟Dom (可以扩展属性) => 生成很是Dom

    var code = generate(root);
    var render = new Function("with(this){ return ".concat(code, " }"));
    return render;
  }

  function patch(oldVnode, vnode) {
    // console.log('oldVnode', oldVnode.nodeType)
    if (oldVnode.nodeType == 1) {
      // console.log('真实元素', vnode)
      // 用Vnode 替换真实 Dom
      var parentEl = oldVnode.parentNode;
      var elm = createElm(vnode); // console.log()
      // 第一次渲染后，就会删除oldVnode

      parentEl.insertBefore(elm, oldVnode.nextSibling);
      parentEl.removeChild(oldVnode);
      return elm;
    }
  }

  function createElm(vnode) {
    var tag = vnode.tag;
        vnode.data;
        var children = vnode.children,
        text = vnode.text;
        vnode.vm;

    if (typeof tag === 'string') {
      // 虚拟节点会有一个el属性，对应真实节点
      vnode.el = document.createElement(tag);
      children.forEach(function (child) {
        vnode.el.appendChild(createElm(child));
      });
    } else {
      vnode.el = document.createTextNode(text);
    }

    return vnode.el;
  }

  // 调度工作

  var queue = [];
  var has = {}; // 列表维护存放了哪些watcher

  function flushSchedulerQueue() {
    for (var i = 0; i < queue.length; i++) {
      queue[i].run();
    }

    queue = [];
    has = {};
    pending = false;
  }

  var pending = false;
  function queueWatcher(watcher) {
    // 多次更新，会收到多个watcher
    var id = watcher.id;

    if (has[id] == null) {
      queue.push(watcher);
      has[id] = true; // 开启一次更新操作 批处理 （防抖）

      if (!pending) {
        nextTick(flushSchedulerQueue);
        pending = true;
      }
    }
  }

  // 一个组件对应一个watcher
  var id = 0;

  var Watcher = /*#__PURE__*/function () {
    function Watcher(vm, exprOrFn, cb, options) {
      _classCallCheck(this, Watcher);

      this.vm = vm;
      this.exprOrFn = exprOrFn;
      this.cb = cb;
      this.options = options;
      this.id = id++; // 给watcher添加标识
      // 默认应该执行exprOrFn
      // exprOrFn 做了渲染和更新
      // 方法被调用的时候，会取值

      this.getter = exprOrFn;
      this.deps = [];
      this.depsId = new Set(); // 默认初始化执行get

      this.get();
    }

    _createClass(Watcher, [{
      key: "get",
      value: function get() {
        pushTarget(this); // Dep的target就是一个watcher

        /* 创建关联 alert 
            * 每个属性都可以收集自己的watcher
           * 希望一个属性可以对应多个watcher
           * 一个watcher可以对应多个属性
        */
        // 稍后用户更新的时候可以重新调用get方法

        this.getter();
        popTarget(); // 这里去除Dep.target,是防止用户在js中取值产生依赖收集
      }
    }, {
      key: "update",
      value: function update() {
        // 每次更新时，把watcher缓存下来 
        // 如果多次跟新的是一个watcher，合并成一个
        // vue中的更新是异步的
        // this.get()
        queueWatcher(this);
      }
    }, {
      key: "run",
      value: function run() {
        // 后续要有其他的功能
        // console.log('run')
        this.get();
      }
    }, {
      key: "addDep",
      value: function addDep(dep) {
        var id = dep.id;

        if (!this.depsId.has(id)) {
          this.depsId.add(id);
          this.deps.push(dep);
          dep.addSub(this);
        }
      }
    }]);

    return Watcher;
  }(); // 在vue中，页面渲染的时候使用的属性，需要进行依赖收集

  function lifecycleMixin(Vue) {
    Vue.prototype._update = function (vnode) {
      // console.log('vnode22', vnode)
      // 即有初始化，又有更新
      // 比较前后的虚拟节点的差异
      var vm = this; // 将新的节点替换掉老的节点

      vm.$el = patch(vm.$el, vnode);
    };

    Vue.prototype.$nextTick = nextTick;
  }
  function mountComponent(vm, el) {
    // 数据变化后，会再次调用更新函数
    var updateComponent = function updateComponent() {
      // 1. 通过render生成虚拟dom
      vm._update(vm._render()); // 后续更新可以调动updateComponent方法
      // 2. 虚拟Dom生成真实Dom

    }; // 观察者模式：属性是被观察者 刷新页面：观察者
    // updateComponent()
    // 如果属性发生变化，就调用updateComponent方法
    // 每一个组件都有一个watcher


    new Watcher(vm, updateComponent, function () {// console.log('我更新视图了')
      // true 告诉他是一个渲染过程
      // 后续还有其他的watcher
    }, true);
  }

  function initMixin(Vue) {
    Vue.prototype._init = function (options) {
      // 这里的this就是当前的Vue实例
      var vm = this; // 给$options赋值

      vm.$options = options;
      initState(vm);

      if (vm.$options.el) {
        // 将数据挂载到这个模板上
        vm.$mount(vm.$options.el);
      }
    };

    Vue.prototype.$mount = function (el) {
      var vm = this;
      var options = vm.$options;
      el = document.querySelector(el);
      vm.$el = el; // 1. 把模板变成渲染函数 => 虚拟Dom => vnode => diff 更新虚拟Dom，最后产生真实节点，一次更新

      if (!options.render) {
        // 这个render是用户自己写的render
        var template = options.template;

        if (!template && el) {
          // 用户没有自己写template，就取el的内容作为模板
          template = el.outerHTML;
          var render = compileToFunction(template);
          options.render = render;
        }
      }

      mountComponent(vm);
    };
  }

  function createElement(vm, tag) {
    var data = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    for (var _len = arguments.length, children = new Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
      children[_key - 3] = arguments[_key];
    }

    // console.log('112233', vnode(vm, tag, data, data.key, children, undefined))
    return vnode(vm, tag, data, data.key, children, undefined);
  }
  function createTextElement(vm, text) {
    return vnode(vm, undefined, undefined, undefined, undefined, text);
  }

  function vnode(vm, tag, data, key, children, text) {
    return {
      vm: vm,
      tag: tag,
      data: data,
      key: key,
      children: children,
      text: text
    };
  }

  function renderMixin(Vue) {
    Vue.prototype._c = function (tag, data) {
      for (var _len = arguments.length, children = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
        children[_key - 2] = arguments[_key];
      }

      // console.log('执行1', tag, data, ...children)
      // 产生虚拟节点
      return createElement.apply(void 0, [this].concat(Array.prototype.slice.call(arguments)));
    };

    Vue.prototype._v = function (text) {
      // console.log('执行2')
      // 产生虚拟节点
      return createTextElement(this, text);
    };

    Vue.prototype._s = function (val) {
      // console.log('执行3')
      // 产生虚拟节点
      if (_typeof(val) === 'object') {
        return JSON.stringify(val);
      }

      return val;
    };

    Vue.prototype._render = function () {
      var vm = this; // console.log('vm.$options.render', vm.$options.render)

      var render = vm.$options.render;
      var vnode = render.call(vm); // console.log('vnode', vnode)

      return vnode;
    };
  }

  /**
   * 
   * @param {*} options 
   * 用户里面 vm.$options
   */

  function Vue(options) {
    //options 使用户传入进来的数据
    this._init(options); // 初始化操作
    // el
    // data

  }

  initMixin(Vue); // _render

  renderMixin(Vue); // _update

  lifecycleMixin(Vue);

  return Vue;

})));
//# sourceMappingURL=vue.js.map
