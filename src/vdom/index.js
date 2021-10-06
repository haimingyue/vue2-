export function createElement(vm, tag, data = {}, ...children) {
    // console.log('112233', vnode(vm, tag, data, data.key, children, undefined))
    return vnode(vm, tag, data, data.key, children, undefined)
}

export function createTextElement(vm, text) {
    return vnode(vm, undefined, undefined, undefined, undefined, text)
}

function vnode(vm, tag, data, key, children, text) {
    return {
        vm,
        tag,
        data,
        key,
        children,
        text
    }
}