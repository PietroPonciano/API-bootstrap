export default class StackRegistry {
  constructor() {
    this.stacks = new Map()
  }

  register(name, Stack) {
    if (!name) {
      throw new Error('Stack name is required')
    }

    if (typeof Stack !== 'function') {
      throw new Error(`Stack "${name}" must be a class`)
    }

    if (this.has(name)) {
      throw new Error(`Stack "${name}" is already registered`)
    }

    this.stacks.set(name, Stack)
  }

  get(name) {
    const Stack = this.stacks.get(name)

    if (!Stack) {
      throw new Error(`Stack "${name}" not found`)
    }

    return Stack
  }

  has(name) {
    return this.stacks.has(name)
  }

  getAvailableStacks() {
    return [...this.stacks.keys()]
  }
}
