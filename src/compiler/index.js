const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`; // 标签名 
const qnameCapture = `((?:${ncname}\\:)?${ncname})`; //  用来获取的标签名的 match后的索引为1的
const startTagOpen = new RegExp(`^<${qnameCapture}`); // 匹配开始标签的 
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`); // 匹配闭合标签的
//           aa  =   "  xxx "  | '  xxxx '  | xxx
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // a=b  a="b"  a='b'
const startTagClose = /^\s*(\/?)>/; //     />   <div/>
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g; // {{aaaaa}}


function createAstElement(tagName, attrs) {
    return {
        tag: tagName,
        type: 1,
        children: [],
        parent: null,
        attrs
    }
}

let root = null
let stack = []
// 将解析后的结果组合成树的结果，通过栈来实现树结构
function start(tagName, attributes) {
    // console.log('start', tagName, attributes)
    let parent = stack[stack.length - 1]
    let element = createAstElement(tagName, attributes)
    if (!root) {
        root = element
    }
    element.parent = parent // 当放入栈中的时候，记录parent
    if (parent) {
        parent.children.push(element)
    }
    stack.push(element)
}

function end(tagName) {
    console.log('end', tagName)
    let last = stack.pop()
    if (last.tag != tagName) {
        throw new Error('标签有错误')
    }
}

function chars(text) {
    console.log(text)
    text = text.replace(/\s/g, '')
    let parent = stack[stack.length - 1]
    if (text) {
        parent.children.push({
            type: 3,
            text
        })
    }
}
function parserHTML(html) { // <div id="app">123</div>. 这里的html，解析一点删除一点.
    // 这里就是正则循环匹配字符串
    function advance(len) {
        html = html.substring(len)
    }
    function parseStartTag() {
        const start = html.match(startTagOpen)
        if (start) { // 如果是开始标签，就要匹配里面的内容了
            const match = {
                tagName: start[1],
                attrs: []
            }
            advance(start[0].length) // 这里已经匹配完标签头了
            let end;
            let attr;
            while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) { // 不停的匹配属性，如果没有遇到标签结尾，就不停的匹配
                match.attrs.push({ name: attr[1], value: attr[3] || attr[4] || attr[5] })
                console.log('attr', attr)
                advance(attr[0].length)
            }
            // 删除结尾 >{{name}}</div>
            if (end) {
                advance(end.length) // 删除结尾 {{name}}</div>
            }
            return match; // 返回{tagName: "div", attrs: Array(2)}

        }
        return false
    }
    while (html) { // 看要解析的内容是否存在，如果存在，就不停的解析
        let textEnd = html.indexOf('<') // 看看当前解析的是不是以<开头
        if (textEnd === 0) { // 情况1. 开始 情况2：闭合标签
            const startTagMatch = parseStartTag(html) // 解析开始标签

            if (startTagMatch) {
                start(startTagMatch.tagName, startTagMatch.attrs)
                console.log('startTagMatch', startTagMatch)
                continue
            }

            const endTagMatch = html.match(endTag)
            if (endTagMatch) {
                end(endTagMatch[1])
                advance(endTagMatch[0].length)
                continue
            }
        }
        let text; // 123</div >
        if (textEnd > 0) {
            text = html.substring(0, textEnd)
        }
        if (text) {
            chars(text)
            advance(text.length)
        }
    }
}

// html解析成脚本来触发
export function compileToFunction(template) {
    console.log('template', template)
    parserHTML(template)
    console.log(root)
}