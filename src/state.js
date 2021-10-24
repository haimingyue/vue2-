import { isFunction } from './util';
import { observe } from './observe/index';
import Watcher from './observe/watcher';
import Dep from './observe/dep';

/**
 * 
 * @param {*} Vue 
 */
export function stateMixin(Vue) {
    Vue.prototype.$watch = function (key, handler, options = {}) {
        // 用户自己写的watcher和渲染watcher区分
        options.user = true
        new Watcher(this, key, handler, options)
    }
}

/**
 * 
 * @param {Vue的实例} vm 
 * initState 说明：
 * 对Vue的数据进行初始化
 * Vue的数据来源有：data，computed，watch，props，inject...
 */
export function initState(vm) {
    const opts = vm.$options
    if (opts.data) {
        // 对数据进行处理
        initData(vm)
    }
    if (opts.computed) {
        // 对数据进行处理
        initComputed(vm, opts.computed)
    }
    if (opts.watch) {
        // 对数据进行处理
        initWatch(vm, opts.watch)
    }
}

function initData(vm) {
    // 用户设置$开头的属性，Vue内部不会进行代理
    let data = vm.$options.data
    // vue2中，会将data中的所有数据，进行数据劫持（Object.defineProperty）
    // 如果data是函数，取返回值，否则去data本身
    // 如果是方法的话，我这里希望方法里面的this都指向VM
    // 通过_data对data 和 vm进行关联
    data = vm._data = isFunction(data) ? data.call(vm) : data
    for (let key in data) {
        proxy(vm, '_data', key)
    }
    // 对数据进行观测
    observe(data)
}

function proxy(vm, source, key) {
    Object.defineProperty(vm, key, {
        get() {
            return vm[source][key]
        },
        set(newValue) {
            vm[source][key] = newValue
        }
    })
}

function initWatch(vm, watch) {
    for (let key in watch) {
        let handler = watch[key]
        if (Array.isArray(handler)) {
            for (let i = 0; i < handler.length; i++) {
                // handler[i]
                createWatcher(vm, key, handler[i])
            }
        } else {
            // handler
            createWatcher(vm, key, handler)
        }
    }
}

function createWatcher(vm, key, handler) {
    // new Watcher()
    return vm.$watch(key, handler)
}

function initComputed(vm, computed) {
    const watchers = vm._computedWatchers = {}
    for (let key in computed) {
        /**
         * userDef 可能是函数
         * 可能是对象
         * 依赖的属性变化，就重新取值
         **/
        const userDef = computed[key]
        let getter = typeof userDef === 'function' ? userDef : userDef.get
        console.log('getter', getter)
        // 这里有多少个getter就要有多少个watcher，每一个计算属性的本质就是一个watcher

        // 将wathcer和属性做一个映射
        watchers[key] = new Watcher(vm, getter, () => { }, { lazy: true }) // 默认不执行
        // 将key定义在vm上
        defineComputed(vm, key, userDef)
    }
}

function defineComputed(vm, key, userDef) {
    let sharedProperty = {}
    if (typeof userDef == 'function') {
        sharedProperty.get = userDef
    } else {
        /**
         * 每一次取值都会走get，
         * 如果发现是脏的，就重新获取
         * 如果不是脏的，就不走get
         * */
        // sharedProperty.get = userDef.get
        sharedProperty.get = createComputedGetter(key)
        sharedProperty.set = userDef.set
    }
    // 截止到这里，watcher 还只是一个Object.defineProperty，没有使用到watcher
    // 接下来就要加缓存
    Object.defineProperty(vm, key, sharedProperty)
}

function createComputedGetter(key) {
    return function computedGetter() {
        // 取计算属性的值，走的是这个函数
        // 谁取值，this就是谁，所以要获取到watcher，就可以把watcher挂载到vm上
        // 通过key可以拿到对应的watcher
        // 这个watcher包含了getter
        // 一旦属性发生变化，就执行watcher中的getter（用户传进来的watch方法）
        let watcher = this._computedWatchers[key]
        if (watcher.dirty) {
            // 根据dirty属性来判断是否需要求值 
            watcher.evaluate()
        }
        /**
         * 如果当前取完值后，Dep.target还有值，需要继续向上收集
         */
        if (Dep.target) {
            // 计算属性watcher内部有两个dep 
            console.log('dep.target', Dep.target)
            watcher.depend() //watcher里面对应了多个dep
        }

        return watcher.value
        /**
         * 
         * computed中的依赖收集，只收集computer中的watcehr
         * 计算出来的fullName是没有记录watcehr的
         * firstname是在computed中使用的，所以，只会收集computed的watcher，不会收集渲染watcher
         * 计算属性中的值，应该记录计算属性watcher和渲染watcher
         */
    }
}