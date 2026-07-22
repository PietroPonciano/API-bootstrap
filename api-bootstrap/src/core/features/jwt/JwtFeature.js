import path from 'node:path'

import Feature from '../Feature.js'
import FileSystemService from '../../filesystem/FileSystemService.js'
import TemplateEngine from '../../templates/TemplateEngine.js'

export default class JwtFeature extends Feature {
  packages() {
    return { dependencies: { bcrypt: '^5.1.1', jsonwebtoken: '^9.0.2' } }
  }

  templates() {
    return [
      'src/middlewares/auth.js',
      'src/middlewares/authorize.js',
      'src/helpers/jwt.js',
      'src/helpers/hash.js'
    ]
  }

  async install() {}

  async patch(project) {
    const source = path.join(project.destination, 'src')
    const templateRoot = path.join(process.cwd(), 'templates', 'express-js', 'src')
    for (const template of this.templates()) {
      const relativePath = template.replace(/^src\//, '')
      const content = await FileSystemService.readFile(
        path.join(templateRoot, `${relativePath}.hbs`)
      )
      await FileSystemService.writeFile(
        path.join(source, relativePath),
        TemplateEngine.render(content, project)
      )
    }
    await FileSystemService.writeFile(
      path.join(source, 'routes', 'auth.js'),
      "const router = require('express').Router();\nconst { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../helpers/jwt');\n\nrouter.post('/refresh', (req, res) => {\n  try { const payload = verifyRefreshToken(req.body.refreshToken); return res.json({ accessToken: signAccessToken({ id: payload.id, role: payload.role }) }); }\n  catch { return res.status(401).json({ message: 'Invalid refresh token' }); }\n});\n\nmodule.exports = router;\n"
    )
  }
}
