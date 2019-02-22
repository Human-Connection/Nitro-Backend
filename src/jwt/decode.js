import jwt from 'jsonwebtoken'

export default async (driver, authorizationHeader) => {
  if (!authorizationHeader) return null
  const token = authorizationHeader.replace('Bearer ', '')
  const encoded = await jwt.verify(token, process.env.JWT_SECRET)
  const { sub: id } = encoded
  const session = driver.session()
  const query = `MATCH (user:User {id: {id} })
        RETURN user {.id, .slug, .name, .avatar, .email, .role} as user LIMIT 1`
  const result = await session.run(query , { id })
  session.close()
  const [currentUser] = await result.records.map((record) => {
    return record.get('user')
  })
  return currentUser
}
