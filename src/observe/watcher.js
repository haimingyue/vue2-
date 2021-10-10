// 一个组件对应一个watcher
let id = 0;
import { popTarget, pushTarget } from './dep';
import { queueWatcher } from './scheduler';

class Watcher {
    constructor(vm, exprOrFn, cb, options) {
        this.vm = vm
        this.exprOrFn = exprOrFn
        this.cb = cb
        this.options = options
        this.id = id++ // 给watcher添加标识

        // 默认应该执行exprOrFn
        // exprOrFn 做了渲染和更新
        // 方法被调用的时候，会取值
        this.getter = exprOrFn
        this.deps = []
        this.depsId = new Set()
        // 默认初始化执行get
        this.get()
    }
    get() {
        pushTarget(this) // Dep的target就是一个watcher

        /* 创建关联 alert 
            * 每个属性都可以收集自己的watcher
           * 希望一个属性可以对应多个watcher
           * 一个watcher可以对应多个属性
        */
        // 稍后用户更新的时候可以重新调用get方法
        this.getter()
        popTarget() // 这里去除Dep.target,是防止用户在js中取值产生依赖收集
    }
    update() {
        // 每次更新时，把watcher缓存下来 
        // 如果多次跟新的是一个watcher，合并成一个
        // vue中的更新是异步的
        // this.get()
        queueWatcher(this)
    }

    run() { // 后续要有其他的功能
        console.log('run')
        this.get()
    }
    addDep(dep) {
        let id = dep.id
        if (!this.depsId.has(id)) {
            this.depsId.add(id)
            this.deps.push(dep)
            dep.addSub(this)
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