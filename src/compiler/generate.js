const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g; // {{aaaaa}}

function genProps(attrs) {
    let str = ''
    for (let i = 0; i < attrs.length; i++) {
        let attr = attrs[i]
        if (attr.name === 'style') {
            let styleObj = {}
            attr.value.replace(/([^:;]+):([^:;]+)/g, function () {
                styleObj[arguments[1]] = arguments[2]
            })
            attr.value = styleObj
        }
        str += `${attr.name}:${JSON.stringify(attr.value)},`
    }
    return `{${str.slice(0, -1)}}`
}

function gen(el) {
    let text = el.text
    if (el.type === 1) { // element: 1 text: 3
        return generate(el)
    } else {
        if (!defaultTagRE.test(text)) {
            return `_v('${text}')`
        } else {
            // 拆分
            let tokens = []
            let match;
            let lastIndex = defaultTagRE.lastIndex = 0;
            while (match = defaultTagRE.exec(text)) {
                // 看有没有匹配到
                let index = match.index // 开始索引
                if (index > lastIndex) {
                    tokens.push(JSON.stringify(text.slice(lastIndex, index)))
                }
                tokens.push(`_s(${match[1].trim()})`)
                lastIndex = index + match[0].length
            }

            if (lastIndex < text.length) {
                tokens.push(JSON.stringify(text.slice(lastIndex)))
            }

            return `_v(${tokens.join('+')})`
        }
    }
}

function genChildren(el) {
    let children = el.children; // 获取儿子
    if (children) {
        return children.map(c => gen(c)).join(',')
    }
    return false;
}

function generate(el) {
    let children = genChildren(el)
    // 遍历🌲，将🌲拼接成字符串
    let code = `_c('${el.tag}', ${el.attrs.length ? genProps(el.attrs) : 'undefined'
        }${children ? `,${children}` : ''})`
    return code
}

export { generate };

