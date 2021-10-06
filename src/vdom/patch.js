export function patch(oldVnode, vnode) {
    if (oldVnode.nodeType == 1) {
        console.log('真实元素')
        // 用Vnode 替换真实 Dom
        const parentEl = oldVnode.parentNode;
        let elm = createElm(vnode)
        console.log()
        parentEl.insertBefore(elm, oldVnode.nextSibling)

        parentEl.removeChild(oldVnode)
    }
}

function createElm(vnode) {
    let { tag, data, children, text, vm } = vnode
    if (typeof tag === 'string') {
        // 虚拟节点会有一个el属性，对应真实节点
        vnode.el = document.createElement(tag)
        children.forEach(child => {
            vnode.el.appendChild(createElm(child))
        })
    } else {
        vnode.el = document.createTextNode(text)
    }
    return vnode.el

}