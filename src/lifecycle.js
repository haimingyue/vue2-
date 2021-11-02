
import { patch } from './vdom/patch';
import Watcher from './observe/watcher';
import { nextTick } from './util';
export function lifecycleMixin(Vue) {
    Vue.prototype._update = function (vnode) {
        // console.log('vnode22', vnode)
        // 即有初始化，又有更新
        // 比较前后的虚拟节点的差异
        const vm = this
        // 将新的节点替换掉老的节点
        vm.$el = patch(vm.$el, vnode)
    }
    Vue.prototype.$nextTick = nextTick
}

export function mountComponent(vm, el) {
    // 数据变化后，会再次调用更新函数
    let updateComponent = () => {
        // 1. 通过render生成虚拟dom
        vm._update(vm._render()) // 后续更新可以调动updateComponent方法
        // 2. 虚拟Dom生成真实Dom
    }
    // 观察者模式：属性是被观察者 刷新页面：观察者
    // updateComponent()
    // 如果属性发生变化，就调用updateComponent方法
    // 每一个组件都有一个watcher
    // 挂载之前，调用beforeMount
    callHook(vm, 'beforeMount')
    new Watcher(vm, updateComponent, () => {
        // console.log('我更新视图了')
        // true 告诉他是一个渲染过程
        // 后续还有其他的watcher
    }, true)
    callHook(vm, 'mounted')
}

/**
 * 调用钩子函数
 * 调用的事哪个实例的，哪个钩子
 * 对象上的数组
 */
export function callHook(vm, hook) {
    let handlers = vm.$options[hook]
    // 找到Hooks就依次执行就行了
    // beforeCreate: [fn1, fn2, fn3]
    if (handlers) {
        for (let i = 0; i < handlers.length; i++) {
            handlers[i].call(vm)
        }
    }
}