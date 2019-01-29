import bcrypt from 'bcryptjs'
import walkRecursive from '../helpers/walkRecursive'

export default {
  Mutation: {
    CreateUser: async (resolve, root, args, context, info) => {
      args.password = await bcrypt.hashSync(args.password, 10)
      const result = await resolve(root, args, context, info)
      result.password = '*****'
      return result
    }
  },
  Query: async (resolve, root, args, context, info) => {
    const result = await resolve(root, args, context, info)
    return walkRecursive(result, ['password'], () => {
      // replace password with asterisk
      return '*****'
    })
  }
}
