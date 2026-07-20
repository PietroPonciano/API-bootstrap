import { configureDatabase } from './database.js'
import initializeSequelize from './sequelizeInitializer.js'

export default async function configure(project) {
  await configureDatabase(project)
  await initializeSequelize(project)
}
