import faker from 'faker'
import uuid from 'uuid/v4'
import helpers from '../seed-helpers'

// random preferences, chance 1 to 3
const preferences = [
  'null',
  '[hideOnlineStatus]',
  'null'
]

export default function create (params) {
  const {
    id = uuid(),
    name = faker.name.findName(),
    email = faker.internet.email(),
    password = '1234',
    role = 'user',
    avatar = faker.internet.avatar(),
    about = faker.lorem.paragraph(),
    disabled = false,
    deleted = false
  } = params

  return `
    mutation {
      CreateUser(
        id: "${id}",
        name: "${name}",
        password: "${password}",
        email: "${email}",
        avatar: "${avatar}",
        about: "${about}",
        role: ${role},
        disabled: ${disabled},
        deleted: ${deleted},
        preferences: ${helpers.random(preferences)}
      ) {
        id
        name
        email
        avatar
        role
        deleted
        disabled
      }
    }
  `
}
