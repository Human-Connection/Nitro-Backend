import neode from '../neode.js'
import faker from 'faker'
import bcrypt from 'bcryptjs'
import slugify from 'slug'

export default async (params = {}) => {
  const {
    name = faker.name.findName(),
    email = faker.internet.email(),
    password = '1234',
    avatar = faker.internet.avatar(),
    role = 'user',
    disabled = false,
    deleted = false
  } = params
  const encryptedPassword = await bcrypt.hashSync(password, 10)

  const slug = slugify(name, {
    lower: true
  })

  return neode.model('User').create({
    name,
    slug,
    role,
    email,
    avatar,
    password: encryptedPassword,
    disabled,
    deleted
  })
}
