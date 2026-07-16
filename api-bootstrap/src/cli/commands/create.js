import ProjectBuilder from '../../core/builder/ProjectBuilder.js'

export default async function createCommand(args) {
  const [template, projectName] = args

  if (!template || !projectName) {
    throw new Error('Usage: create <template> <project-name>')
  }

  const builder = new ProjectBuilder()

  const result = await builder.build({
    template,

    destination: `./${projectName}`,

    variables: {
      PROJECT_NAME: projectName,

      DESCRIPTION: `${projectName} API`,

      AUTHOR: 'API Bootstrap',

      YEAR: new Date().getFullYear().toString()
    }
  })

  console.log('✔ Project created!')

  console.log(result.path)
}
