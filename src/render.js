import { createElement, createTextElement } from './vdom/index';

export function renderMixin(Vue) {
    Vue.prototype._c = function (tag, data, ...children) {
        // console.log('执行1', tag, data, ...children)
        // 产生虚拟节点
        return createElement(this, ...arguments)
    }
    Vue.prototype._v = function (text) {
        // console.log('执行2')
        // 产生虚拟节点
        return createTextElement(this, text)
    }
    Vue.prototype._s = function (val) {
        // console.log('执行3')
        // 产生虚拟节点
        if (typeof val === 'object') {
            return JSON.stringify(val)
        }
        return val
    }
    Vue.prototype._render = function () {
        const vm = this
        // console.log('vm.$options.render', vm.$options.render)
        let render = vm.$options.render
        let vnode = render.call(vm)
        // console.log('vnode', vnode)
        return vnode;
    }
}
