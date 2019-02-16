import neode from '../neode.js'
import faker from 'faker'

export default async (params) => {
  const {
    name = faker.name.findName(),
    email = faker.internet.email(),
    avatar = faker.internet.avatar()
  } = params || {}

  return neode.model('user').create({
    name,
    email,
    avatar,
    password: '1234',
    disabled: false,
    deleted: false
  })
}
