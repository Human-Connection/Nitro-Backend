import { query } from '../graphql-schema'
import { v1 as neo4j } from 'neo4j-driver'
import dotenv from 'dotenv'

dotenv.config()

const driver = neo4j.driver(
    process.env.NEO4J_URI || 'bolt://localhost:7687',
    neo4j.auth.basic(
        process.env.NEO4J_USER || 'neo4j',
        process.env.NEO4J_PASSWORD || 'neo4j'
    )
)
let session = null
session = driver.session()
query('MATCH (n) OPTIONAL MATCH (n)-[r]-() DELETE n,r', session).then(() => {
    console.log('Successfully deleted the nodes and relations!')
}).catch((err) => {
    console.log(`Error occurred deleting the nodes and relations (clear the db)\n\n${err}`)
}).finally(() => {
    if (session) {
        session.close()
    }
    process.exit(0)
})

console.log(JSON.stringify(process.env, null, 2))
