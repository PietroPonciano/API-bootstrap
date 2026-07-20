import Stack from './Stack.js'
import StackRegistry from './StackRegistry.js'
import ExpressStack from './node-express/ExpressStack.js'

const stacks = new StackRegistry()

stacks.register('node-express', ExpressStack)

export { Stack, StackRegistry, ExpressStack }
export default stacks
