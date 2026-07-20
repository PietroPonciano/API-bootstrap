import path from 'node:path'

import FileSystemService from '../../filesystem/FileSystemService.js'

function pascalCase(value) {
  return String(value)
    .replace(/(^|[-_\s])(\w)/g, (_, __, char) => char.toUpperCase())
    .replace(/[^a-zA-Z0-9]/g, '')
}

function camelCase(value) {
  const pascal = pascalCase(value)
  return pascal.charAt(0).toLowerCase() + pascal.slice(1)
}

function sequelizeType(type = 'STRING') {
  const allowed = new Set([
    'STRING',
    'TEXT',
    'INTEGER',
    'BIGINT',
    'BOOLEAN',
    'DATE',
    'DATEONLY',
    'FLOAT',
    'DECIMAL',
    'UUID',
    'JSON'
  ])
  const normalized = String(type).toUpperCase()
  return allowed.has(normalized) ? normalized : 'STRING'
}

function renderAttributes(fields = []) {
  return fields
    .map((field) => {
      const options = [`type: DataTypes.${sequelizeType(field.type)}`]
      if (field.required) options.push('allowNull: false')
      if (field.unique) options.push('unique: true')
      return `    ${field.name}: { ${options.join(', ')} }`
    })
    .join(',\n')
}

export default async function generateModels(project) {
  const tables = project.tables || []
  const modelsDirectory = path.join(project.destination, 'src', 'models')
  const migrationsDirectory = path.join(project.destination, 'migrations')
  await FileSystemService.createDirectory(modelsDirectory)
  await FileSystemService.createDirectory(migrationsDirectory)

  const exportedModels = []
  for (const [index, table] of tables.entries()) {
    if (!table.name) throw new Error('Table name is required')
    const Model = pascalCase(table.name)
    const attributes = renderAttributes(table.fields)
    const model = `const { Model, DataTypes } = require('sequelize');\nconst sequelize = require('../config/sequelize');\n\nclass ${Model} extends Model {}\n\n${Model}.init({\n${attributes}\n}, { sequelize, modelName: '${Model}', tableName: '${table.name}' });\n\n${Model}.associate = (models) => {\n${renderRelations(table, project.relations || [])}\n};\n\nmodule.exports = ${Model};\n`
    await FileSystemService.writeFile(path.join(modelsDirectory, `${Model}.js`), model)
    const migration = `'use strict';\n\nmodule.exports = {\n  async up(queryInterface, Sequelize) {\n    await queryInterface.createTable('${table.name}', {\n      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },\n${renderMigrationFields(table.fields)}\n      createdAt: { type: Sequelize.DATE, allowNull: false },\n      updatedAt: { type: Sequelize.DATE, allowNull: false }\n    });\n  },\n  async down(queryInterface) { await queryInterface.dropTable('${table.name}'); }\n};\n`
    await FileSystemService.writeFile(
      path.join(migrationsDirectory, `${Date.now()}-${index}-${table.name}.js`),
      migration
    )
    exportedModels.push(`const ${Model} = require('./${Model}');`)
  }

  if (tables.length) {
    const names = tables.map((table) => pascalCase(table.name)).join(', ')
    await FileSystemService.writeFile(
      path.join(modelsDirectory, 'index.js'),
      `${exportedModels.join('\n')}\n\nconst models = { ${names} };\nObject.values(models).forEach((model) => model.associate?.(models));\nmodule.exports = models;\n`
    )
  }
}

function renderMigrationFields(fields = []) {
  return fields
    .map(
      (field) =>
        `      ${field.name}: { type: Sequelize.${sequelizeType(field.type)}, allowNull: ${!field.required}${field.unique ? ', unique: true' : ''} },\n`
    )
    .join('')
}

function renderRelations(table, relations) {
  return relations
    .filter((relation) => relation.from === table.name)
    .map((relation) => {
      const target = pascalCase(relation.to)
      const foreignKey = relation.foreignKey || `${camelCase(relation.to)}Id`
      const methods = {
        hasOne: 'hasOne',
        hasMany: 'hasMany',
        belongsTo: 'belongsTo',
        belongsToMany: 'belongsToMany'
      }
      const method = methods[relation.type]
      if (!method) return ''
      const through = relation.through ? `, through: '${relation.through}'` : ''
      return `  ${table ? pascalCase(table.name) : 'Model'}.${method}(models.${target}, { foreignKey: '${foreignKey}'${through} });`
    })
    .join('\n')
}
