import path from 'node:path'

import Feature from '../Feature.js'
import FileSystemService from '../../filesystem/FileSystemService.js'

export default class QualityFeature extends Feature {
  packages() {
    return {
      dependencies: { helmet: '^7.1.0', morgan: '^1.10.0' },
      devDependencies: { eslint: '^9.0.0', prettier: '^3.0.0' }
    }
  }
  templates() {
    return ['.prettierrc.json']
  }
  async install() {}
  async patch(project) {
    await FileSystemService.writeFile(
      path.join(project.destination, '.prettierrc.json'),
      '{\n  "singleQuote": true,\n  "semi": false\n}\n'
    )
    const appPath = path.join(project.destination, 'src', 'app.js')
    const app = await FileSystemService.readFile(appPath)
    await FileSystemService.writeFile(
      appPath,
      app
        .replace(
          "const routes = require('./routes');\n",
          "const routes = require('./routes');\nconst helmet = require('helmet');\nconst morgan = require('morgan');\n"
        )
        .replace(
          'app.use(express.json());',
          "app.use(helmet());\napp.use(morgan('dev'));\napp.use(express.json());"
        )
    )
  }
}
