import { mergeOptions } from "../util";

// 在类上面扩展
export function initGlobalApi(Vue) {
    Vue.options = {}
    /**
     * options用于存放全局配置，每个组件初始化的时候，都会和options选项进行合并
     * Vue.component
     * Vue.filter
     * Vue.directive
     */
    Vue.mixin = function (options) {
        /**
         * options是一个对象
         * {
         *  beforeMounted() {xxx}
         * }
         * 这里是把 当前的options和传入的options进行合并
         */
        this.options = mergeOptions(this.options, options)
        return this;
    }
    Vue.options._base = Vue // 无论后续创建多少个子类，都可以通过_base找到父类
    Vue.options.components = {} // 组件可能不是一个，可能会注册多个
    Vue.component = function (id, definition) {
        /**
         * id: 组件的名称
         * definition: 组件的定义
         * 为了父子关系，还要创建一个子类，保证组件隔离
         * 每个组件产生一个类，继承父类
         */
        definition = this.options._base.extend(definition)
        this.options.components[id] = definition
    }
    /**
     * extend的作用：产生一个类
     */
    Vue.extend = function (opts) {
        // 产生一个继承与Vue的类，并且身上应该有父类的所有的功能
        const Super = this
        // 根据类产生了一个类，这个类继承自父类
        // 这个继承要重写constructor 
        const Sub = function VueComponent(options) {
            // 调用当前组件的init方法
            this._init(options)
        }
        Sub.prototype = Object.create(Super.prototype)
        Sub.prototype.constructor = Sub
        // 子类的options要包含全局的options和自己的opt
        Sub.options = mergeOptions(Super.options, opts)
        return Sub
    }
}