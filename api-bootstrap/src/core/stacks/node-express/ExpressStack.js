import Stack from '../Stack.js'
import FileSystemService from '../../filesystem/FileSystemService.js'

import install from './installer.js'
import configure from './configurator.js'
import generate from './generator.js'
import TemplateInstaller from '../../templates/TemplateInstaller.js'

export default class ExpressStack extends Stack {
  async create() {
    await FileSystemService.createDirectory(this.project.destination)
    await TemplateInstaller.install({
      template: 'express-js',
      destination: this.project.destination,
      variables: this.project.variables ?? {}
    })
  }

  async install() {
    await install(this.project)
  }

  async configure() {
    await configure(this.project)
  }

  async generate() {
    await generate(this.project)
  }
}
