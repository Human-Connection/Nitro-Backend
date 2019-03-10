import userManagement from './resolvers/user_management.js'
import statistics from './resolvers/statistics.js'
import reports from './resolvers/reports.js'
import posts from './resolvers/posts.js'
import moderation from './resolvers/moderation.js'
import schemas from './schemas'

export const typeDefs = schemas

export const resolvers = {
  Query: {
    ...statistics.Query,
    ...userManagement.Query
  },
  Mutation: {
    ...userManagement.Mutation,
    ...reports.Mutation,
    ...moderation.Mutation,
    ...posts.Mutation
  }
}
