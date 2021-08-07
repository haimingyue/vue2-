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

      console.log('inserted', inserted);

      if (inserted) {
        // 如果有新增的值，就继续劫持，这里要观测的是数组的每一项
        ob.observeArray(inserted);
      }
    };
  });

  var Observer = /*#__PURE__*/function () {
    function Observer(data) {
      _classCallCheck(this, Observer);

      // 给当前的数组添加一个属性，当前的observer的实例
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
  }(); // vue2为什么性能低？
  // 因为Vue2会对对象进行遍历，将每个属性用defineProperty重新定义（全量劫持）


  function defineReactive(data, key, value) {
    // value 有可能是对象（对象套对象），递归劫持
    observe(value);
    Object.defineProperty(data, key, {
      get: function get() {
        return value;
      },
      set: function set(newV) {
        observe(newV); // 如果用户赋值的是一个新对象，需要将这个对象进行劫持

        value = newV;
      }
    });
  }

  function observe(data) {
    if (!isObject(data)) {
      return;
    }

    if (data.__ob__) {
      return;
    }

    console.log('ok', data);
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
    }

    console.log('data2', data); // 对数据进行观测

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

  function initMixin(Vue) {
    Vue.prototype._init = function (options) {
      // 这里的this就是当前的Vue实例
      var vm = this; // 给$options赋值

      vm.$options = options;
      initState(vm);
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

  initMixin(Vue);

  return Vue;

})));
//# sourceMappingURL=vue.js.map
