import fs from 'node:fs/promises'
import path from 'node:path'

class FileSystemService {
  static async createDirectory(directoryPath) {
    await fs.mkdir(directoryPath, { recursive: true })
  }

  static async readFile(filePath) {
    return await fs.readFile(filePath, 'utf-8')
  }

  static async writeFile(filePath, content) {
    const directory = path.dirname(filePath)

    await fs.mkdir(directory, { recursive: true })

    await fs.writeFile(filePath, content, 'utf-8')
  }

  static async copyDirectory(source, destination) {
    await fs.cp(source, destination, {
      recursive: true
    })
  }

  static async deleteFile(filePath) {
    await fs.unlink(filePath)
  }

  static async exists(path) {
    try {
      await fs.access(path)

      return true
    } catch {
      return false
    }
  }

  static async readDirectory(directory) {
    return await fs.readdir(directory, {
      withFileTypes: true
    })
  }
}

export default FileSystemService
