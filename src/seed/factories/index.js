import neode from '../neode.js'

const creators = {
  'user': require('./users.js').default,
  'post': require('./posts.js').default
}

const create = (model, parameters) => {
  return creators[model](parameters)
}

const cleanDatabase = () => {
  const deleteAll = 'MATCH (n) OPTIONAL MATCH (n)-[r]-() DELETE n,r;'
  return neode.cypher(deleteAll)
}

export {
  create,
  cleanDatabase
}
