import { ipcMain } from 'electron'
import { access } from 'node:fs/promises'
import { constants } from 'node:fs'
import path from 'node:path'

import ProjectBuilder from '../../core/builder/ProjectBuilder.js'

const builder = new ProjectBuilder()

const CONNECTION_TIMEOUT = 5500

function withTimeout(promise) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Connection timeout')), CONNECTION_TIMEOUT)
    )
  ])
}

const CONNECTION_ERROR =
  'Não foi possível conectar ao banco. Verifique host, porta, usuário e senha.'

async function testPostgres(database) {
  const { Client } = await import('pg')
  const options = {
    host: database.host,
    port: Number(database.port || 5432),
    user: database.username,
    password: database.password,
    database: database.name,
    connectionTimeoutMillis: 5000
  }
  const client = new Client(options)
  try {
    await client.connect()
    await client.query('SELECT 1')
    return { success: true }
  } catch (error) {
    if (error.code !== '3D000') throw error
    const adminClient = new Client({ ...options, database: 'postgres' })
    try {
      await adminClient.connect()
      await adminClient.query('SELECT 1')
      return {
        success: true,
        message: 'Conexão validada. Crie o banco informado antes de executar as migrations.'
      }
    } finally {
      await adminClient.end().catch(() => {})
    }
  } finally {
    await client.end().catch(() => {})
  }
}

async function testMysql(database) {
  const mysql = await import('mysql2/promise')
  const options = {
    host: database.host,
    port: Number(database.port || 3306),
    user: database.username,
    password: database.password,
    database: database.name,
    connectTimeout: 5000
  }
  let connection
  try {
    connection = await mysql.createConnection(options)
    await connection.query('SELECT 1')
    return { success: true }
  } catch (error) {
    if (error.code !== 'ER_BAD_DB_ERROR') throw error
    const adminConnection = await mysql.createConnection({ ...options, database: undefined })
    try {
      await adminConnection.query('SELECT 1')
      return {
        success: true,
        message: 'Conexão validada. Crie o banco informado antes de executar as migrations.'
      }
    } finally {
      await adminConnection.end().catch(() => {})
    }
  } finally {
    await connection?.end().catch(() => {})
  }
}

export async function testConnection(database, destination) {
  if (database?.type === 'sqlite') {
    await access(path.dirname(destination || process.cwd()), constants.W_OK)
    return { success: true, message: 'Pasta de destino validada para o arquivo SQLite.' }
  }
  if (database?.type === 'mysql') return withTimeout(testMysql(database))
  return withTimeout(testPostgres(database))
}

async function validateConnection(project) {
  try {
    return await testConnection(project.database, project.destination)
  } catch {
    throw new Error(CONNECTION_ERROR)
  }
}

export default function registerGeneratorIPC() {
  ipcMain.handle('generator:test-connection', async (_, project) => {
    try {
      const result = await validateConnection(project)
      return { success: true, message: result.message || 'Conexão com o banco validada.' }
    } catch (error) {
      return { success: false, message: error.message }
    }
  })

  ipcMain.handle('generator:create', async (_, project) => {
    try {
      await validateConnection(project)
      const result = await builder.build(project)

      return {
        success: true,
        data: result
      }
    } catch (error) {
      return {
        success: false,
        message: error.message
      }
    }
  })
}
