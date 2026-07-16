import createCommand from './commands/create.js'

async function main() {
  const [command, ...args] = process.argv.slice(2)

  switch (command) {
    case 'create':
      await createCommand(args)

      break

    default:
      console.log(`
API Bootstrap

Commands:

create <template> <project-name>

            `)
  }
}

main()
