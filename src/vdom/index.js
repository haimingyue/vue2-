import { isObject, isReservedTag } from '../util';
export function createElement(vm, tag, data = {}, ...children) {
    // console.log('112233', vnode(vm, tag, data, data.key, children, undefined))
    /**
     * 如果tag是一个组件的话，就根据组件创建一个Vnode
     * 
     */

    if (isReservedTag(tag)) {
        return vnode(vm, tag, data, data.key, children, undefined)
    } else {
        console.log('tag', tag)
        const Ctor = vm.$options.components[tag]
        return createComponent(vm, tag, data, data.key, children, Ctor)
    }
}

function createComponent(vm, tag, data, key, children, Ctor) {
    // 最核心的是要的：组件的构造函数
    // 这里的Ctor有可能是对象，有可能是函数
    // 如果是对象，就需要把它保证成一个函数
    if (isObject(Ctor)) {
        Ctor = vm.$options._base.extend(Ctor)
    }
    console.log('Ctor', Ctor)
    data.hook = {
        init(vnode) {
            // 初始化组件
            let vm = vnode.componentInstance = new Ctor({
                _isComponent: true
            })  // new Sub 会用此选项和组价的配置进行合并
            console.log('vmmmmm', vm)
            vm.$mount()
        }
    }
    return vnode(vm, `vue-component-${tag}`, data, key, undefined, undefined, { Ctor, children })
}

export function createTextElement(vm, text) {
    return vnode(vm, undefined, undefined, undefined, undefined, text)
}

function vnode(vm, tag, data, key, children, text, componentOptions) {
    return {
        vm,
        tag,
        data,
        key,
        children,
        text,
        componentOptions
    }
}