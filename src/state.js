import { isFunction } from './util';
import { observe } from './observe/index';
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
    // if (opts.computed) {
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