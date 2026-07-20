import ProjectBuilder from '../../core/builder/ProjectBuilder.js'

export default async function createCommand(args) {
  const [stack, projectName] = args

  if (!stack || !projectName) {
    throw new Error('Usage: create <stack> <project-name>')
  }

  const builder = new ProjectBuilder()

  const result = await builder.build({
    stack,

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
