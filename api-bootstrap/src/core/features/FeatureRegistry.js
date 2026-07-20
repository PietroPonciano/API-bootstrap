export default class FeatureRegistry {
  constructor() {
    this.features = new Map()
  }

  register(name, Feature) {
    if (!name || typeof Feature !== 'function') throw new Error('Invalid feature')
    if (this.features.has(name)) throw new Error(`Feature "${name}" is already registered`)
    this.features.set(name, Feature)
  }

  get(name) {
    const Feature = this.features.get(name)
    if (!Feature) throw new Error(`Feature "${name}" not found`)
    return Feature
  }

  has(name) {
    return this.features.has(name)
  }

  getAvailableFeatures() {
    return [...this.features.keys()]
  }
}
