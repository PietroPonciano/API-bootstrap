import path from 'node:path'

import FileSystemService from '../../filesystem/FileSystemService.js'

const TYPES = new Set([
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

function pascalCase(value) {
  return String(value)
    .replace(/(^|[-_\s])(\w)/g, (_, __, character) => character.toUpperCase())
    .replace(/[^a-zA-Z0-9]/g, '')
}

function camelCase(value) {
  const valueInPascalCase = pascalCase(value)
  return valueInPascalCase.charAt(0).toLowerCase() + valueInPascalCase.slice(1)
}

function sequelizeType(type = 'STRING') {
  const normalized = String(type).toUpperCase()
  return TYPES.has(normalized) ? normalized : 'STRING'
}

function relationForeignKeys(table, tables, relations) {
  return relations.flatMap((relation) => {
    const targetTable = tables.find((item) => item.name === relation.to)
    const sourceTable = tables.find((item) => item.name === relation.from)
    const owner =
      relation.type === 'belongsTo'
        ? relation.from
        : relation.type === 'hasOne' || relation.type === 'hasMany'
          ? relation.to
          : null
    const referenced = owner === relation.from ? targetTable : sourceTable
    if (owner !== table.name || !referenced) return []
    const name = relation.foreignKey || `${camelCase(referenced.name)}Id`
    if ((table.fields || []).some((field) => field.name === name)) return []
    return [
      {
        name,
        referencedTable: referenced,
        onDelete: relation.onDelete || 'CASCADE',
        onUpdate: relation.onUpdate || 'CASCADE'
      }
    ]
  })
}

function renderValidation(field) {
  const validation = field.validate || {}
  const entries = []
  if (validation.email) entries.push('isEmail: true')
  if (validation.min !== undefined)
    entries.push(
      `len: [${Number(validation.min)}, ${validation.max === undefined ? 'Infinity' : Number(validation.max)}]`
    )
  if (validation.enum?.length) entries.push(`isIn: [${JSON.stringify(validation.enum)}]`)
  return entries.length ? `, validate: { ${entries.join(', ')} }` : ''
}

function renderAttributes(table, foreignKeys) {
  const fields = table.fields || []
  const attributes = fields.map((field) => {
    const options = [`type: DataTypes.${sequelizeType(field.type)}`]
    if (field.required) options.push('allowNull: false')
    if (field.unique) options.push('unique: true')
    if (field.defaultValue !== undefined && field.defaultValue !== '')
      options.push(`defaultValue: ${JSON.stringify(field.defaultValue)}`)
    const validation = renderValidation(field)
    return `    ${field.name}: { ${options.join(', ')}${validation} }`
  })
  foreignKeys.forEach((foreignKey) =>
    attributes.push(
      `    ${foreignKey.name}: { type: DataTypes.${foreignKey.referencedTable.primaryKeyType === 'uuid' ? 'UUID' : 'INTEGER'}, allowNull: false }`
    )
  )
  return attributes.join(',\n')
}

function renderMigrationFields(table, foreignKeys) {
  const fields = (table.fields || []).map((field) => {
    const defaultValue =
      field.defaultValue !== undefined && field.defaultValue !== ''
        ? `, defaultValue: ${JSON.stringify(field.defaultValue)}`
        : ''
    return `      ${field.name}: { type: Sequelize.${sequelizeType(field.type)}, allowNull: ${!field.required}${field.unique ? ', unique: true' : ''}${defaultValue} },\n`
  })
  foreignKeys.forEach((foreignKey) =>
    fields.push(
      `      ${foreignKey.name}: { type: Sequelize.${foreignKey.referencedTable.primaryKeyType === 'uuid' ? 'UUID' : 'INTEGER'}, allowNull: false, references: { model: '${foreignKey.referencedTable.name}', key: 'id' }, onDelete: '${foreignKey.onDelete}', onUpdate: '${foreignKey.onUpdate}' },\n`
    )
  )
  return fields.join('')
}

function primaryKey(table) {
  return table.primaryKeyType === 'uuid'
    ? 'id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.UUIDV4 }'
    : 'id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true }'
}

function renderRelations(table, relations) {
  return relations
    .filter((relation) => relation.from === table.name)
    .map((relation) => {
      const method = ['hasOne', 'hasMany', 'belongsTo', 'belongsToMany'].includes(relation.type)
        ? relation.type
        : null
      if (!method) return ''
      const foreignKey =
        relation.foreignKey ||
        `${camelCase(relation.type === 'belongsTo' ? relation.to : relation.from)}Id`
      const through =
        relation.type === 'belongsToMany'
          ? `, through: '${relation.through || `${table.name}_${relation.to}`}'`
          : ''
      return `  ${pascalCase(table.name)}.${method}(models.${pascalCase(relation.to)}, { foreignKey: '${foreignKey}'${through} });`
    })
    .join('\n')
}

function sortTables(tables, relations) {
  const dependencies = new Map(tables.map((table) => [table.name, new Set()]))
  relations.forEach((relation) => {
    if (relation.type === 'belongsTo') dependencies.get(relation.from)?.add(relation.to)
    if (relation.type === 'hasOne' || relation.type === 'hasMany')
      dependencies.get(relation.to)?.add(relation.from)
  })
  const sorted = []
  const visiting = new Set()
  const visited = new Set()
  function visit(name) {
    if (visited.has(name)) return
    if (visiting.has(name)) throw new Error(`Circular relationship detected for table "${name}"`)
    visiting.add(name)
    dependencies.get(name)?.forEach(visit)
    visiting.delete(name)
    visited.add(name)
    const table = tables.find((item) => item.name === name)
    if (table) sorted.push(table)
  }
  tables.forEach((table) => visit(table.name))
  return sorted
}

export default async function generateModels(project) {
  const tables = project.tables || []
  const relations = project.relations || []
  const modelsDirectory = path.join(project.destination, 'src', 'models')
  const migrationsDirectory = path.join(project.destination, 'migrations')
  const seedersDirectory = path.join(project.destination, 'seeders')
  await FileSystemService.createDirectory(modelsDirectory)
  await FileSystemService.createDirectory(migrationsDirectory)
  await FileSystemService.createDirectory(seedersDirectory)
  const exportedModels = []
  const orderedTables = sortTables(tables, relations)

  for (const [index, table] of orderedTables.entries()) {
    if (!table.name) throw new Error('Table name is required')
    const Model = pascalCase(table.name)
    const foreignKeys = relationForeignKeys(table, tables, relations)
    const model = `const { Model, DataTypes } = require('sequelize');\nconst sequelize = require('../config/sequelize');\n\nclass ${Model} extends Model {}\n\n${Model}.init({\n${renderAttributes(table, foreignKeys)}\n}, { sequelize, modelName: '${Model}', tableName: '${table.name}', paranoid: ${Boolean(table.paranoid)} });\n\n${Model}.associate = (models) => {\n${renderRelations(table, relations)}\n};\n\nmodule.exports = ${Model};\n`
    await FileSystemService.writeFile(path.join(modelsDirectory, `${Model}.js`), model)
    const indexes = (table.indexes || [])
      .map(
        (indexDefinition) =>
          `{ fields: ${JSON.stringify(indexDefinition.fields || indexDefinition)} }`
      )
      .join(', ')
    const migration = `'use strict';\n\nmodule.exports = {\n  async up(queryInterface, Sequelize) {\n    await queryInterface.createTable('${table.name}', {\n      ${primaryKey(table)},\n${renderMigrationFields(table, foreignKeys)}      createdAt: { type: Sequelize.DATE, allowNull: false },\n      updatedAt: { type: Sequelize.DATE, allowNull: false }${table.paranoid ? ',\n      deletedAt: { type: Sequelize.DATE, allowNull: true }' : ''}\n    });\n${indexes ? `    await queryInterface.addIndex('${table.name}', ${indexes});\n` : ''}  },\n  async down(queryInterface) { await queryInterface.dropTable('${table.name}'); }\n};\n`
    await FileSystemService.writeFile(
      path.join(migrationsDirectory, `${Date.now()}-${index}-${table.name}.js`),
      migration
    )
    const seedValues = Object.fromEntries(
      (table.fields || [])
        .filter((field) => field.name !== 'id')
        .map((field) => [field.name, field.defaultValue ?? sampleValue(field.type)])
    )
    await FileSystemService.writeFile(
      path.join(seedersDirectory, `${Date.now()}-${index}-demo-${table.name}.js`),
      `'use strict';\n\nmodule.exports = {\n  async up(queryInterface) { await queryInterface.bulkInsert('${table.name}', [{ ...${JSON.stringify(seedValues)}, createdAt: new Date(), updatedAt: new Date() }]); },\n  async down(queryInterface) { await queryInterface.bulkDelete('${table.name}', null, {}); }\n};\n`
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

function sampleValue(type) {
  if (sequelizeType(type) === 'BOOLEAN') return false
  if (['INTEGER', 'BIGINT', 'FLOAT', 'DECIMAL'].includes(sequelizeType(type))) return 0
  if (sequelizeType(type) === 'DATE' || sequelizeType(type) === 'DATEONLY')
    return new Date().toISOString()
  return 'example'
}
