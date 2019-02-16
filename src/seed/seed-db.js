import { create } from  './factories'

(async () => {
  if (process.env.NODE_ENV === 'production') {
    throw new Error(`YOU CAN'T SEED THE DATABASE WITH NODE_ENV=${process.env.NODE_ENV}`)
  }

  try {
    const [admin, moderator, user, ...otherUsers] = await Promise.all([
      create('user', {name: 'Peter Lustig'      , email: 'admin@example.org'}),
      create('user', {name: 'Bob der Baumeister', email: 'moderator@example.org'}),
      create('user', {name: 'Jenny Rostock'     , email: 'user@example.org'}),
      create('user'),
      create('user')
    ])
    await Promise.all([
      create('post', {author: admin}),
      create('post', {author: moderator}),
      create('post', {author: user}),
      create('post'),
      create('post'),
      create('post')
    ])

    console.log('Successfully seeded the database!')
  } catch(err) {
    console.log(`Error during database seeding!\n${err}`)
  } finally {
    process.exit(0)
  }
})()
