import { initState } from "./state"

// 表示在vue的基础上做一次混合操作
export function initMixin(Vue) {
    Vue.prototype._init = function (options) {
        // 这里的this就是当前的Vue实例
        const vm = this
        // 给$options赋值
        vm.$options = options
        initState(vm)
    }
}