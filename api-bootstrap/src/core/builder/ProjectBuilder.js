import TemplateInstaller from '../templates/TemplateInstaller.js'

export default class ProjectBuilder {
  async build(options) {
    const {
      template,
      destination,
      variables = {}
    } = options

    console.log('Installing template...')

    await TemplateInstaller.install({
      template,
      destination,
      variables
    })

    return {
      success: true,
      path: destination
    }
  }
}
