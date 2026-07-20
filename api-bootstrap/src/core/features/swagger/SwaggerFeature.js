import path from 'node:path'

import Feature from '../Feature.js'
import FileSystemService from '../../filesystem/FileSystemService.js'

export default class SwaggerFeature extends Feature {
  packages() {
    return { dependencies: { 'swagger-jsdoc': '^6.2.8', 'swagger-ui-express': '^5.0.1' } }
  }

  templates() {
    return ['src/config/swagger.js']
  }

  async install() {}

  async patch(project) {
    const configPath = path.join(project.destination, 'src', 'config', 'swagger.js')
    await FileSystemService.writeFile(
      configPath,
      "const swaggerJsdoc = require('swagger-jsdoc');\n\nmodule.exports = swaggerJsdoc({ definition: { openapi: '3.0.0', info: { title: process.env.npm_package_name || 'API', version: '1.0.0' } }, apis: [] });\n"
    )
    const appPath = path.join(project.destination, 'src', 'app.js')
    const app = await FileSystemService.readFile(appPath)
    const patch =
      "const swaggerUi = require('swagger-ui-express');\nconst swaggerSpec = require('./config/swagger');\n"
    await FileSystemService.writeFile(
      appPath,
      app
        .replace(
          "const routes = require('./routes');\n",
          "const routes = require('./routes');\n" + patch
        )
        .replace(
          'app.use(routes);',
          "app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));\napp.use(routes);"
        )
    )
  }
}
