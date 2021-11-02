export function isFunction(val) {
    return typeof val === 'function'
}

export function isObject(val) {
    return typeof val === 'object' && val != null
}

const callbacks = []

function flushCallbacks() {
    callbacks.forEach(cb => cb())
    waiting = false
}

let waiting = false

function timer(flushCallbacks) {
    let timerFn = () => { }
    if (Promise) {
        timerFn = () => {
            Promise.resolve().then(flushCallbacks)
        }
    } else if (MutationObserver) {
        // 这个也是微任务
        let textNode = document.createTextNode(1)
        let observe = new MutationObserver(flushCallbacks)
        observe.observe(textNode, {
            characterData: true
        })
        timerFn = () => {
            textNode.textContent = 3
        }
    } else if (setImmediate) {
        timerFn = () => {
            setImmediate(flushCallbacks)
        }
    } else {
        timerFn = () => {
            setTimeout(flushCallbacks, 0)
        }
    }
    timerFn()
}

export function nextTick(cb) {
    callbacks.push(cb) // 先修改数据 flush(先执行) / 后用户调用vm.$nextTick(后)
    if (!waiting) {
        timer(flushCallbacks)
        waiting = true
    }
}

let lifeCycleHooks = [
    'beforeCreate',
    'created',
    'beforeMount',
    'mounted',
    'beforeUpdate',
    'updated',
    'destoryed',
    'beforeDestory'
]

let strats = {} // 这里存放着各种策略

function mergeHook(parentVal, childVal) {
    if (childVal) {
        if (parentVal) {
            return parentVal.concat(childVal)
        } else {
            return [childVal]
        }
    } else {
        return parentVal
    }
}

lifeCycleHooks.forEach(hook => {
    strats[hook] = mergeHook
})

strats.components = function (parentVal, childVal) {
    let options = Object.create(parentVal) // 根据父对象构造一个新对象
    if (childVal) {
        for (let key in childVal) {
            options[key] = childVal[key]
        }
    }
    return options
}

strats.data = function () {

}

// strats.components = function () {

// }

export function mergeOptions(parent, child) {
    const options = {} // 存放合并后的结果
    // 如果父亲里面有元素，则进行合并
    // 合并以儿子的值为准
    for (let key in parent) {
        mergeField(key)
    }
    /**
     * 如果儿子里面有：
     * 1. 如果父亲里面已经有了，就不进行合并了。
     * 2. 如果父亲没有，则进行合并
     */
    for (let key in child) {
        if (parent.hasOwnProperty(key)) {
            continue
        }
        mergeField(key)
    }
    function mergeField(key) {
        /**
         * 获取父亲和儿子的值，只用策略模式进行合并
         * 
         */
        let parentVal = parent[key]
        let childVal = child[key]
        // 通过策略模式，做不同的事情
        if (strats[key]) {
            // 如果有对应的策略，就调用对应的策略就好
            options[key] = strats[key](parentVal, childVal)
        } else {
            /**
             * 如果父亲和儿子都是对象，则使用扩展运算符进行合并
             * 扩展运算符...后面对象的元素会覆盖前面元素的值
             * 否则直接使用儿子的值
             */
            if (isObject(parentVal) && isObject(childVal)) {
                options[key] = { ...parentVal, ...childVal }
            } else {
                options[key] = child[key] || parent[key]
            }
        }
    }
    return options;
}

export function isReservedTag(str) {
    // return function (str) {
    // 源码根据，生成隐射表
    let reservedTag = 'a, div, span, img, button, ul, li'
    return reservedTag.includes(str)
    // }
}