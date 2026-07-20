import features from '../../features/index.js'
import generateModels from './modelGenerator.js'

export default async function generate(project) {
  await generateModels(project)

  for (const name of project.features || []) {
    const feature = new (features.get(name))()
    await feature.install(project)
    await feature.patch(project)
  }
}
