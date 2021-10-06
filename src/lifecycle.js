
import { patch } from './vdom/patch';
export function lifecycleMixin(Vue) {
    Vue.prototype._update = function (vnode) {
        console.log('vnode', vnode)
        // 即有初始化，又有更新
        // 比较前后的虚拟节点的差异
        const vm = this
        patch(vm.$el, vnode)
    }
}

export function mountComponent(vm, el) {
    // 数据变化后，会再次调用更新函数
    let updateComponent = () => {
        // 1. 通过render生成虚拟dom
        vm._update(vm._render()) // 后续更新可以调动updateComponent方法
        // 2. 虚拟Dom生成真实Dom
    }
    updateComponent()
}