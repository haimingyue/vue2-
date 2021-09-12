import { parserHTML } from './parser'
import { generate } from './generate'

// html解析成脚本来触发
export function compileToFunction(template) {
    console.log('templatetemplatetemplatetemplate', template)
    let root = parserHTML(template)
    console.log('rootrootroot', root)
    // ast （只能描述语法）=> render => 虚拟Dom (可以扩展属性) => 生成很是Dom
    // render() {
    //     return _c('div', { id: 'app', a: 1 }, 'hello')
    // }
    let code = generate(root)
    console.log(code)
}