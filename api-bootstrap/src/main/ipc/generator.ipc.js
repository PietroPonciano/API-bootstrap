import { ipcMain } from 'electron'

import ProjectBuilder from '../../core/builder/ProjectBuilder.js'

const builder = new ProjectBuilder()

export default function registerGeneratorIPC() {
  ipcMain.handle('generator:create', async (_, project) => {
    try {
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