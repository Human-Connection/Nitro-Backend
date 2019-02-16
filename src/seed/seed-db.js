import { create } from  './factories'

(async () => {
  if (process.env.NODE_ENV === 'production') {
    throw new Error(`YOU CAN'T SEED THE DATABASE WITH NODE_ENV=${process.env.NODE_ENV}`)
  }

  try {
    const [peter, fritz, bob] = await Promise.all([
      create('user', {name: 'Peter Lustig'}),
      create('user', {name: 'Fritz Fuchs'}),
      create('user', {name: 'Bob der Baumeister'})
    ])
    const post = await create('post')
    const wrote = await peter.relateTo(post, 'wrote')
    console.log(wrote)

    console.log('Successfully seeded the database!')
  } catch(err) {
    console.log(`Error during database seeding!\n${err}`)
  } finally {
    process.exit(0)
  }
})()
