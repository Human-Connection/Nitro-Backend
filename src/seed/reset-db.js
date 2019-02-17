import { cleanDatabase } from './factories'

(async () => {
  if (process.env.NODE_ENV === 'production') {
    throw new Error(`YOU CAN'T CLEAN THE DATABASE WITH NODE_ENV=${process.env.NODE_ENV}`)
  }

  try {
    await cleanDatabase()
    /* eslint-disable-next-line no-console */
    console.log('Successfully deleted all nodes and relations!')
  } catch(err) {
    /* eslint-disable-next-line no-console */
    console.log(`Error occurred deleting the nodes and relations (reset the db)\n\n${err}`)
  } finally {
    process.exit(0)
  }
})()
