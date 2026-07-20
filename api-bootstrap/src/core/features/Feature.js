export default class Feature {
  async install() {
    throw new Error('install() not implemented')
  }

  packages() {
    throw new Error('packages() not implemented')
  }

  templates() {
    throw new Error('templates() not implemented')
  }

  async patch() {
    throw new Error('patch() not implemented')
  }
}
