import { initState } from "./state"
import { compileToFunction } from './compiler/index';
import { mountComponent, callHook } from './lifecycle';
import { mergeOptions } from "./util";

// 表示在vue的基础上做一次混合操作
export function initMixin(Vue) {
    Vue.prototype._init = function (options) {
        // 这里的this就是当前的Vue实例
        const vm = this
        // 给$options赋值
        // vm.$options = options
        // constructor始终指向创建当前对象的构造函数
        vm.$options = mergeOptions(vm.constructor.options, options)
        console.log('vm.$options', vm.$options)
        // 没有初始化的时候，执行beforeCreate
        callHook(vm, 'beforeCreate')
        initState(vm)
        // 初始化结束之后，执行created
        callHook(vm, 'created')

        if (vm.$options.el) {
            // 将数据挂载到这个模板上
            vm.$mount(vm.$options.el)
        }
    }

    Vue.prototype.$mount = function (el) {
        const vm = this
        const options = vm.$options
        el = document.querySelector(el)
        vm.$el = el
        // 1. 把模板变成渲染函数 => 虚拟Dom => vnode => diff 更新虚拟Dom，最后产生真实节点，一次更新
        if (!options.render) {
            // 这个render是用户自己写的render
            let template = options.template
            if (!template && el) {
                // 用户没有自己写template，就取el的内容作为模板
                template = el.outerHTML
            }
            let render = compileToFunction(template)
            options.render = render
        }
        mountComponent(vm, el)
    }
}