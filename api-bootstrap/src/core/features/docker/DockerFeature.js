import path from 'node:path'

import Feature from '../Feature.js'
import FileSystemService from '../../filesystem/FileSystemService.js'

export default class DockerFeature extends Feature {
  packages() {
    return { dependencies: {} }
  }
  templates() {
    return ['Dockerfile', 'docker-compose.yml']
  }
  async install() {}
  async patch(project) {
    await FileSystemService.writeFile(
      path.join(project.destination, 'Dockerfile'),
      'FROM node:20-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci\nCOPY . .\nEXPOSE 3000\nCMD ["npm", "start"]\n'
    )
    await FileSystemService.writeFile(
      path.join(project.destination, 'docker-compose.yml'),
      "services:\n  api:\n    build: .\n    ports:\n      - '3000:3000'\n    env_file: .env\n"
    )
  }
}
