import { parserHTML } from './parser'
import { generate } from './generate'

// html解析成脚本来触发
export function compileToFunction(template) {
    let root = parserHTML(template)
    // ast （只能描述语法）=> render => 虚拟Dom (可以扩展属性) => 生成很是Dom
    let code = generate(root)

    let render = new Function(`with(this){ return ${code} }`)
    return render
}