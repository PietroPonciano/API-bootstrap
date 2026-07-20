/**
 * Contrato base para todas as tecnologias suportadas pelo gerador.
 */
export default class Stack {
  constructor(project) {
    this.project = project
  }

  async create() {
    throw new Error('create() not implemented')
  }

  async install() {
    throw new Error('install() not implemented')
  }

  async configure() {
    throw new Error('configure() not implemented')
  }

  async generate() {
    throw new Error('generate() not implemented')
  }
}
