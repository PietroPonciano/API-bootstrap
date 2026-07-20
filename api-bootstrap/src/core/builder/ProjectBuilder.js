import Logger from '../logger/Logger.js'
import stacks from '../stacks/index.js'


export default class ProjectBuilder {


  async build(options) {


    const {
      stack: stackName,
      destination,
      variables = {}
    } = options



    Logger.info(
      "Iniciando criação do projeto"
    )


    Logger.info(
      `Stack: ${stackName}`
    )


    Logger.info(
      `Destino: ${destination}`
    )



    const Stack = stacks.get(stackName)
    const stack = new Stack({
      ...options,
      stack: stackName,
      destination,
      variables
    })

    await stack.create()
    await stack.install()
    await stack.configure()
    await stack.generate()



    Logger.info(
      "Projeto criado com sucesso"
    )



    return {

      success: true,

      path: destination

    }

  }

}
