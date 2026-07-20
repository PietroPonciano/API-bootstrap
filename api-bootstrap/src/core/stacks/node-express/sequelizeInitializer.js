import path from 'node:path'

import FileSystemService from '../../filesystem/FileSystemService.js'

/** Creates the same base directories and configuration expected from `sequelize init`. */
export default async function initializeSequelize(project) {
  const root = project.destination
  await FileSystemService.createDirectory(path.join(root, 'migrations'))
  await FileSystemService.createDirectory(path.join(root, 'seeders'))
  await FileSystemService.createDirectory(path.join(root, 'src', 'models'))
  await FileSystemService.writeFile(
    path.join(root, '.sequelizerc'),
    "const path = require('path');\n\nmodule.exports = { config: path.resolve('src/config/database.js'), 'models-path': path.resolve('src/models'), 'migrations-path': path.resolve('migrations'), 'seeders-path': path.resolve('seeders') };\n"
  )
  await FileSystemService.writeFile(
    path.join(root, 'src', 'config', 'sequelize.js'),
    "const { Sequelize } = require('sequelize');\nconst config = require('./database');\n\nmodule.exports = new Sequelize(config);\n"
  )
}
