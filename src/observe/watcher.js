// 一个组件对应一个watcher
let id = 0;
import { popTarget, pushTarget } from './dep';
import { queueWatcher } from './scheduler';

class Watcher {
    constructor(vm, exprOrFn, cb, options) {
        this.vm = vm
        this.exprOrFn = exprOrFn
        this.user = !!options.user // 标识是不是用户写的watcher
        this.lazy = !!options.lazy
        // 默认的dirty是脏的
        // 如果是计算属性，则默认dirty是true | lazy也是true
        this.dirty = options.lazy
        this.cb = cb
        this.options = options
        this.id = id++ // 给watcher添加标识

        // 默认应该执行exprOrFn
        // exprOrFn 做了渲染和更新
        // 方法被调用的时候，会取值
        if (typeof exprOrFn == 'string') {
            // 这里需要将表达式转换成函数
            this.getter = function () {
                // 当数据取值的时候，会进行依赖收集
                // 每次取值的时候，用户自己写的watcher就会被收集
                // 这里的取值可以类比页面渲染的取值{{}}
                let path = exprOrFn.split('.')
                let obj = vm
                for (let i = 0; i < path.length; i++) {
                    obj = obj[path[i]]
                }
                return obj // 走getter方法
            }
        } else {
            this.getter = exprOrFn
        }
        this.deps = []
        this.depsId = new Set()
        // 默认初始化执行get
        // 第一次渲染的时候的value
        // 如果是lazy就什么都不做
        this.value = this.lazy ? undefined : this.get()
    }
    get() {
        pushTarget(this) // Dep的target就是一个watcher

        /* 创建关联 alert 
            * 每个属性都可以收集自己的watcher
           * 希望一个属性可以对应多个watcher
           * 一个watcher可以对应多个属性
        */
        // 稍后用户更新的时候可以重新调用get方法
        // 这里拿到的值是辛的值
        const value = this.getter.call(this.vm)
        popTarget() // 这里去除Dep.target,是防止用户在js中取值产生依赖收集
        return value
    }
    update() {
        // 每次更新时，把watcher缓存下来 
        // 如果多次跟新的是一个watcher，合并成一个
        // vue中的更新是异步的
        // this.get()

        // 如果当前的watcher是lazy的，则说明是计算属性的watcher
        if (this.lazy) {
            this.dirty = true
        } else {
            queueWatcher(this)
        }
    }

    run() { // 后续要有其他的功能
        // console.log('run')
        let newValue = this.get()
        let oldValue = this.value
        this.value = newValue // 为了保证下一次更新的时候，这一个新值是下一个的老值
        if (this.user) {
            this.cb.call(this.vm, newValue, oldValue)
        }
    }
    addDep(dep) {
        let id = dep.id
        if (!this.depsId.has(id)) {
            this.depsId.add(id)
            this.deps.push(dep)
            dep.addSub(this)
        }
    }

    evaluate() {
        // 把dirty置位false，说明取过值了
        this.dirty = false
        // get就是watcher传进来的exprOrFn
        this.value = this.get()
    }

    depend() {
        let i = this.deps.length
        while (i--) {
            this.deps[i].depend()
        }
    }

}

// 在vue中，页面渲染的时候使用的属性，需要进行依赖收集
// 收集对象渲染的watcher
// 渲染页面前，会将当前的watcher放到Dep上
// 我们将更新的功能封装成一个watcher
// 取值的时候，给每个属性都加了一个dep属性，用于存储这个渲染watcher => 同一个watcher对应多个dep
// 每个属性，可能对应多个视图，多个视图有多个watcher => 一个属性要对应多个watcher
// 双向存储 
export default Watcher