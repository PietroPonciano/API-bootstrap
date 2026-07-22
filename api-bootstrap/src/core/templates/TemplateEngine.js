import Handlebars from 'handlebars'

function pascalCase(value = '') {
  return String(value)
    .replace(/(^|[-_\s])(\w)/g, (_, __, character) => character.toUpperCase())
    .replace(/[^a-zA-Z0-9]/g, '')
}

function camelCase(value = '') {
  const result = pascalCase(value)
  return result.charAt(0).toLowerCase() + result.slice(1)
}

Handlebars.registerHelper('pascalCase', pascalCase)
Handlebars.registerHelper('camelCase', camelCase)

class TemplateEngine {
  static render(content, variables = {}) {
    this.validate(content, variables)
    return Handlebars.compile(content, { noEscape: true })(variables)
  }

  static extract(content) {
    const placeholders = new Set()
    const expression = /{{{?\s*([A-Za-z_][\w.]*)/g
    let match
    while ((match = expression.exec(content)) !== null) {
      const key = match[1]
      if (
        !['if', 'unless', 'each', 'with', 'else', 'pascalCase', 'camelCase'].includes(key) &&
        !key.startsWith('@')
      )
        placeholders.add(key.split('.')[0])
    }
    return [...placeholders]
  }

  static validate(content, variables = {}) {
    const missing = this.extract(content).filter((placeholder) => !(placeholder in variables))
    if (missing.length) throw new Error(`Missing template variables: ${missing.join(', ')}`)
  }
}

export default TemplateEngine
