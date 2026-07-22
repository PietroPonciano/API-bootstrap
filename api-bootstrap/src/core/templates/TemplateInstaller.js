import path from 'node:path'

import FileSystemService from '../filesystem/FileSystemService.js'

import TemplateLoader from './TemplateLoader.js'
import TemplateValidator from './TemplateValidator.js'
import TemplateEngine from './TemplateEngine.js'

class TemplateInstaller {
  static textExtensions = new Set([
    '.js',
    '.json',
    '.md',
    '.txt',
    '.env',
    '.example',
    '.gitignore',
    '.yml',
    '.yaml',
    '.html',
    '.css',
    '.xml'
  ])

  static async install({ template, destination, variables }) {
    const loadedTemplate = await TemplateLoader.load(template)

    await TemplateValidator.validate(loadedTemplate)

    await FileSystemService.copyDirectory(loadedTemplate.path, destination)

    await this.processDirectory(destination, variables)
  }

  static async processDirectory(directory, variables) {
    const entries = await FileSystemService.readDirectory(directory)

    for (const entry of entries) {
      const fullPath = path.join(directory, entry.name)

      if (entry.isDirectory()) {
        await this.processDirectory(fullPath, variables)

        continue
      }

      if (entry.name.endsWith('.hbs')) {
        await FileSystemService.deleteFile(fullPath)
        continue
      }

      if (!this.shouldRender(fullPath)) {
        continue
      }

      const content = await FileSystemService.readFile(fullPath)

      const rendered = TemplateEngine.render(content, variables)

      await FileSystemService.writeFile(fullPath, rendered)
    }
  }

  static shouldRender(filePath) {
    const extension = path.extname(filePath)

    const filename = path.basename(filePath)

    return this.textExtensions.has(extension) || filename === '.gitignore'
  }
}

export default TemplateInstaller
