async function setActiveTime (context) {
  if (!context.user) return
  const session = context.driver.session()
  await session.run(`
      MATCH(u:User {id: $userId})
      SET u.lastActiveAt = $lastActiveAt`, {
    userId: context.user.id,
    lastActiveAt: (new Date()).toISOString()
  })
  session.close()
}

export default {
  Mutation: async (resolve, root, args, context, info) => {
    setActiveTime(context)
    return resolve(root, args, context, info)
  },
  Query: async (resolve, root, args, context, info) => {
    setActiveTime(context)
    return resolve(root, args, context, info)
  }
}
