import path from 'node:path'

import Feature from '../Feature.js'
import FileSystemService from '../../filesystem/FileSystemService.js'

export default class JwtFeature extends Feature {
  packages() {
    return { dependencies: { bcrypt: '^5.1.1', jsonwebtoken: '^9.0.2' } }
  }

  templates() {
    return ['src/middlewares/auth.js', 'src/helpers/jwt.js']
  }

  async install() {}

  async patch(project) {
    const source = path.join(project.destination, 'src')
    await FileSystemService.writeFile(
      path.join(source, 'helpers', 'jwt.js'),
      "const jwt = require('jsonwebtoken');\n\nfunction sign(payload) {\n  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });\n}\n\nmodule.exports = { sign };\n"
    )
    await FileSystemService.writeFile(
      path.join(source, 'middlewares', 'auth.js'),
      "const jwt = require('jsonwebtoken');\n\nmodule.exports = (req, res, next) => {\n  const token = req.headers.authorization?.replace('Bearer ', '');\n  if (!token) return res.status(401).json({ message: 'Token required' });\n  try { req.user = jwt.verify(token, process.env.JWT_SECRET); return next(); }\n  catch { return res.status(401).json({ message: 'Invalid token' }); }\n};\n"
    )
  }
}
