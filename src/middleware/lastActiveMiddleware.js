import values from 'lodash/values'

const queue = {
  users: {},
  driver: null,
  add: (context, lastActiveAt) => {
    queue.driver = context.driver
    queue.users[context.user.id] = {
      id: context.user.id,
      lastActiveAt
    }
  },
  run: async () => {
    if (!queue.driver || !values(queue.users).length) return

    const users = { ...queue.users }
    queue.users = {}

    const session = queue.driver.session()
    await session.run(`
      UNWIND $users AS user
      MATCH(u:User {id: user.id})
      SET u.lastActiveAt = user.lastActiveAt`, {
      users: values(users)
    })
    session.close()
  }
}
setInterval(queue.run, 10000)

export default {
  Mutation: async (resolve, root, args, context, info) => {
    if (context.user) queue.add(context, (new Date()).toISOString())
    return resolve(root, args, context, info)
  },
  Query: async (resolve, root, args, context, info) => {
    if (context.user) queue.add(context, (new Date()).toISOString())
    return resolve(root, args, context, info)
  }
}
