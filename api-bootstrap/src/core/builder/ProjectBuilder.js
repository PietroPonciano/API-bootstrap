import TemplateInstaller from '../templates/TemplateInstaller.js'
import Logger from '../logger/Logger.js'


export default class ProjectBuilder {


  async build(options) {


    const {
      template,
      destination,
      variables = {}
    } = options



    Logger.info(
      "Iniciando criação do projeto"
    )


    Logger.info(
      `Template: ${template}`
    )


    Logger.info(
      `Destino: ${destination}`
    )



    await TemplateInstaller.install({

      template,

      destination,

      variables

    })



    Logger.info(
      "Projeto criado com sucesso"
    )



    return {

      success: true,

      path: destination

    }

  }

}