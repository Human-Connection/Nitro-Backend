import fs from 'fs'
import path from 'path'
import { mergeTypes } from 'merge-graphql-schemas'

const loadSchema = file => {
  return fs.readFileSync(path.join(__dirname, file)).toString('utf-8')
}

let typeDefs = []

fs.readdirSync(__dirname).forEach(file => {
  if (file.split('.').pop() === 'gql') {
    typeDefs.push(loadSchema(file))
  }
})

export default mergeTypes(typeDefs, { all: true })
