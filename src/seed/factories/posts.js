import neode from '../neode.js'
import createUser from './users.js'
import faker from 'faker'
import slugify from 'slug'

export default function (params = {}) {
  const {
    title = faker.lorem.sentence(),
    content = Array.from({ length: 10 }, () => faker.lorem.sentence()).join(' '),
    image = 'https://picsum.photos/1280/1024?image=424',
    visibility = 'public',
    disabled = false,
    deleted = false
  } = params

  const slug = slugify(title, {
    lower: true
  })

  return neode.model('Post').create({
    title,
    slug,
    content,
    image,
    visibility,
    disabled,
    deleted
  }).then((post) => {
    // ensure each post has an author
    return new Promise(function(resolve, reject) {
      if (params.author) {
        resolve(params.author.relateTo(post, 'wrote'))
      } else {
        createUser().then((author) => {
          resolve(author.relateTo(post, 'wrote'))
        })
      }
    })
  })
}
