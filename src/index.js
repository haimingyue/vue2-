import { initMixin } from './init';
import { renderMixin } from './render';
import { lifecycleMixin } from './lifecycle';
import { stateMixin } from './state'
import { initGlobalApi } from './global-api/index';

/**
 * 
 * @param {*} options 
 * 用户里面 vm.$options
 */
function Vue(options) {
    //options 使用户传入进来的数据
    this._init(options);  // 初始化操作
    // el
    // data
}
initMixin(Vue)
// _render
renderMixin(Vue)
// _update
lifecycleMixin(Vue)
stateMixin(Vue)
// 帮我初始化一个全局Api，在类上面扩展
initGlobalApi(Vue)


export default Vue