let oldArrayPrototype = Array.prototype
export let arrayMethods = Object.create(oldArrayPrototype)

// arrayMethods.__proto__ = Array.prototype 继承

let methods = [
    'shift',
    'unshift',
    'pop',
    'push',
    'splice',
    'reverse',
    'sort'
]

// 改写的用自己的，没有改写的用原来的。
methods.forEach(method => {
    arrayMethods[method] = function (...args) {
        // 这里的args是传入的参数列表
        // 比如arr.push(1,2,3),则 ...args = [1, 2, 3]
        oldArrayPrototype[method].call(this, ...args)
        let inserted;
        let ob = this.__ob__;
        switch (method) {
            case 'push':
            case 'unshift':
                inserted = args;
                break;
            case 'splice':
                inserted = args.slice(2);
            default:
                break;
        }
        if (inserted) {
            // 如果有新增的值，就继续劫持，这里要观测的是数组的每一项
            ob.observeArray(inserted)
        }
    }
})
