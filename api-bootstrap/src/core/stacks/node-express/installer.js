import path from 'node:path'

import features from '../../features/index.js'
import FileSystemService from '../../filesystem/FileSystemService.js'

const DATABASE_PACKAGES = {
  postgresql: { pg: '^8.12.0', 'pg-hstore': '^2.3.4' },
  mysql: { mysql2: '^3.11.0' },
  sqlite: { sqlite3: '^5.1.7' }
}

export default async function install(project) {
  const packagePath = path.join(project.destination, 'package.json')
  const packageJson = JSON.parse(await FileSystemService.readFile(packagePath))
  const database = project.database?.type || project.database || 'postgresql'
  const selectedFeatures = project.features || []
  const additions = {
    dependencies: {
      sequelize: '^6.37.3',
      ...(DATABASE_PACKAGES[database] || DATABASE_PACKAGES.postgresql)
    },
    devDependencies: { 'sequelize-cli': '^6.6.2' }
  }

  for (const name of selectedFeatures) {
    const Feature = features.get(name)
    const packages = new Feature().packages()
    Object.assign(additions.dependencies, packages.dependencies)
    Object.assign(additions.devDependencies, packages.devDependencies)
  }

  packageJson.dependencies = { ...packageJson.dependencies, ...additions.dependencies }
  packageJson.devDependencies = { ...packageJson.devDependencies, ...additions.devDependencies }
  packageJson.scripts = {
    ...packageJson.scripts,
    'db:migrate': 'sequelize db:migrate',
    'db:migrate:undo': 'sequelize db:migrate:undo'
  }
  await FileSystemService.writeFile(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`)
}
