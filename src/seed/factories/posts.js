import neode from '../neode.js'
import createUser from './users.js'
import faker from 'faker'

export default function (params = {}) {
  const {
    title = faker.lorem.sentence(),
    content = Array.from({ length: 10 }, () => faker.lorem.sentence()).join(' ')
  } = params

  return neode.model('post').create({
    title,
    content,
    image: 'https://picsum.photos/1280/1024?image=424',
    visibility: 'public',
    disabled: false,
    deleted: false
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
