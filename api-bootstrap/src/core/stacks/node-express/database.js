import path from 'node:path'
import crypto from 'node:crypto'

import FileSystemService from '../../filesystem/FileSystemService.js'

const DIALECTS = { postgresql: 'postgres', mysql: 'mysql', sqlite: 'sqlite' }

export async function configureDatabase(project) {
  const database = project.database?.type || project.database || 'postgresql'
  const dialect = DIALECTS[database] || 'postgres'
  const config =
    database === 'sqlite'
      ? "require('dotenv').config();\n\nmodule.exports = { dialect: 'sqlite', storage: process.env.DB_STORAGE || './database.sqlite', logging: false, pool: { max: 5, min: 0, acquire: 30000, idle: 10000 } };\n"
      : "require('dotenv').config();\n\nmodule.exports = { dialect: '" +
        dialect +
        "', host: process.env.DB_HOST, port: process.env.DB_PORT, database: process.env.DB_NAME, username: process.env.DB_USER, password: process.env.DB_PASSWORD, logging: false, pool: { max: 5, min: 0, acquire: 30000, idle: 10000 } };\n"
  const env =
    database === 'sqlite'
      ? 'PORT=3000\nDB_STORAGE=./database.sqlite\n'
      : `PORT=3000\nDB_HOST=${project.database?.host || 'localhost'}\nDB_PORT=${project.database?.port || (database === 'mysql' ? '3306' : '5432')}\nDB_NAME=${project.database?.name || project.variables?.PROJECT_NAME || 'api_bootstrap'}\nDB_USER=${project.database?.username || 'postgres'}\nDB_PASSWORD=${project.database?.password || ''}\n`

  const featureEnv = (project.features || []).includes('jwt')
    ? `JWT_SECRET=${crypto.randomBytes(32).toString('hex')}\nJWT_REFRESH_SECRET=${crypto.randomBytes(32).toString('hex')}\nJWT_ACCESS_EXPIRES_IN=15m\nJWT_REFRESH_EXPIRES_IN=7d\n`
    : ''

  await FileSystemService.writeFile(
    path.join(project.destination, 'src', 'config', 'database.js'),
    config
  )
  await FileSystemService.writeFile(path.join(project.destination, '.env'), env + featureEnv)
}
