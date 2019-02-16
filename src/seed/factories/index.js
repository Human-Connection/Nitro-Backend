const creators = {
  'user': require('./users.js').default,
  'post': require('./posts.js').default
}

const create = (model, parameters) => {
  return creators[model](parameters)
}


export {
  create
}
