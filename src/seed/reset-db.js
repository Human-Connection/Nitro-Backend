import neode from './neode.js'

(async () => {
  if (process.env.NODE_ENV === 'production') {
    throw new Error(`YOU CAN'T CLEAN THE DATABASE WITH NODE_ENV=${process.env.NODE_ENV}`)
  }

  try {
    const deleteAll = 'MATCH (n) OPTIONAL MATCH (n)-[r]-() DELETE n,r;'
    const response = await neode.cypher(deleteAll)
    /* eslint-disable-next-line no-console */
    console.log('Successfully deleted all nodes and relations!')
  } catch(err) {
    /* eslint-disable-next-line no-console */
    console.log(`Error occurred deleting the nodes and relations (reset the db)\n\n${err}`)
  } finally {
    process.exit(0)
  }
})()
