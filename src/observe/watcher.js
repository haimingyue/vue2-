// 一个组件对应一个watcher
let id = 0;
import { popTarget, pushTarget } from './dep';

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

export default Watcher