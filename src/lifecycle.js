
import { patch } from './vdom/patch';
import Watcher from './observe/watcher';
export function lifecycleMixin(Vue) {
    Vue.prototype._update = function (vnode) {
        // console.log('vnode22', vnode)
        // 即有初始化，又有更新
        // 比较前后的虚拟节点的差异
        const vm = this
        // 将新的节点替换掉老的节点
        vm.$el = patch(vm.$el, vnode)
    }
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
    new Watcher(vm, updateComponent, () => {
        // console.log('我更新视图了')
        // true 告诉他是一个渲染过程
        // 后续还有其他的watcher
    }, true)
}