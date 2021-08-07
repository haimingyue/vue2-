import { isObject } from "../util"
import { arrayMethods } from './array';

class Observer {
    constructor(data) {
        // 给当前的数组添加一个属性，当前的observer的实例
        // data.__ob__ = this
        // 这里用__ob__会出现死循环，因为会不停的执行defineReactive
        Object.defineProperty(data, '__ob__', {
            value: this,
            enumerable: false // 不可枚举
        })

        // 对对象中的所有属性进行劫持
        if (Array.isArray(data)) {
            // 切片编程（高阶函数），改写原来的数组
            // 用户调用时：如果调用的是“劫持”的七个变异方法，就用自己重写的，否则调用原来的。
            data.__proto__ = arrayMethods
            // 如果数组里面是对象的话，需要对对象进行监控
            this.observeArray(data)
        } else {
            this.walk(data)
        }
    }

    observeArray(data) {
        // 遍历data
        data.forEach(item => {
            // 对item进行观测
            // 对数组里面的数组和对象进行监控
            observe(item)
        })
    }
    walk(data) {
        Object.keys(data).forEach(key => {
            // 把对象中的所有的属性定义成响应式的
            defineReactive(data, key, data[key])
        })
    }
}

// vue2为什么性能低？
// 因为Vue2会对对象进行遍历，将每个属性用defineProperty重新定义（全量劫持）
function defineReactive(data, key, value) {
    // value 有可能是对象（对象套对象），递归劫持
    observe(value)
    Object.defineProperty(data, key, {
        get() {
            return value
        },
        set(newV) {
            observe(newV)
            // 如果用户赋值的是一个新对象，需要将这个对象进行劫持
            value = newV
        }
    })
}

export function observe(data) {
    if (!isObject(data)) {
        return
    }
    if (data.__ob__) {
        return
    }

    return new Observer(data)
}