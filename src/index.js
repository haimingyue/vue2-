import { initMixin } from './init';

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

export default Vue;