import Factory from './seed/factories'
import { GraphQLClient, request } from 'graphql-request'
import jwt from 'jsonwebtoken'
import { host, login } from './jest/helpers'

const factory = Factory()

beforeEach(async () => {
  await factory.create('user', {
    email: 'test@example.org',
    password: '1234'
  })
})

afterEach(async () => {
  await factory.cleanDatabase()
})

describe('isLoggedIn', () => {
  const query = '{ isLoggedIn }'
  describe('unauthenticated', () => {
    it('returns false', async () => {
      await expect(request(host, query)).resolves.toEqual({ isLoggedIn: false })
    })
  })

  describe('with malformed JWT Bearer token', () => {
    const headers = { authorization: 'blah' }
    const client = new GraphQLClient(host, { headers })

    it('returns false', async () => {
      await expect(client.request(query)).resolves.toEqual({ isLoggedIn: false })
    })
  })

  describe('with valid JWT Bearer token', () => {
    // here is the decoded JWT token:
    // {
    //   role: 'user',
    //   locationName: null,
    //   name: 'Jenny Rostock',
    //   about: null,
    //   avatar: 'https://s3.amazonaws.com/uifaces/faces/twitter/sasha_shestakov/128.jpg',
    //   id: 'u3',
    //   email: 'user@example.org',
    //   slug: 'jenny-rostock',
    //   iat: 1550846680,
    //   exp: 1637246680,
    //   aud: 'http://localhost:3000',
    //   iss: 'http://localhost:4000',
    //   sub: 'u3'
    // }
    const headers = { authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoidXNlciIsImxvY2F0aW9uTmFtZSI6bnVsbCwibmFtZSI6Ikplbm55IFJvc3RvY2siLCJhYm91dCI6bnVsbCwiYXZhdGFyIjoiaHR0cHM6Ly9zMy5hbWF6b25hd3MuY29tL3VpZmFjZXMvZmFjZXMvdHdpdHRlci9zYXNoYV9zaGVzdGFrb3YvMTI4LmpwZyIsImlkIjoidTMiLCJlbWFpbCI6InVzZXJAZXhhbXBsZS5vcmciLCJzbHVnIjoiamVubnktcm9zdG9jayIsImlhdCI6MTU1MDg0NjY4MCwiZXhwIjoxNjM3MjQ2NjgwLCJhdWQiOiJodHRwOi8vbG9jYWxob3N0OjMwMDAiLCJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjQwMDAiLCJzdWIiOiJ1MyJ9.eZ_mVKas4Wzoc_JrQTEWXyRn7eY64cdIg4vqQ-F_7Jc' }
    const client = new GraphQLClient(host, { headers })

    it('returns false', async () => {
      await expect(client.request(query)).resolves.toEqual({ isLoggedIn: false })
    })

    describe('and a corresponding user in the database', () => {
      it('returns true', async () => {
        // see the decoded token above
        await factory.create('user', { id: 'u3' })
        await expect(client.request(query)).resolves.toEqual({ isLoggedIn: true })
      })
    })
  })
})

describe('login', () => {
  const mutation = (params) => {
    const { email, password } = params
    return `
      mutation {
        login(email:"${email}", password:"${password}"){
          token
        }
      }`
  }

  describe('ask for a `token`', () => {
    describe('with valid email/password combination', () => {
      it('responds with a JWT token', async () => {
        const data = await request(host, mutation({
          email: 'test@example.org',
          password: '1234'
        }))
        const { token } = data.login
        jwt.verify(token, process.env.JWT_SECRET, (err, data) => {
          expect(data.email).toEqual('test@example.org')
          expect(err).toBeNull()
        })
      })
    })

    describe('with a valid email but incorrect password', () => {
      it('responds with "Incorrect email address or password."', async () => {
        await expect(
          request(host, mutation({
            email: 'test@example.org',
            password: 'wrong'
          }))
        ).rejects.toThrow('Incorrect email address or password.')
      })
    })

    describe('with a non-existing email', () => {
      it('responds with "Incorrect email address or password."', async () => {
        await expect(
          request(host, mutation({
            email: 'non-existent@example.org',
            password: 'wrong'
          }))
        ).rejects.toThrow('Incorrect email address or password.')
      })
    })
  })
})

describe('report', () => {
  beforeEach(async () => {
    await factory.create('user', {
      email: 'test@example.org',
      password: '1234'
    })
    await factory.create('user', {
      id: 'u2',
      name: 'abusive-user',
      role: 'user',
      email: 'abusive-user@example.org'
    })
  })

  afterEach(async () => {
    await factory.cleanDatabase()
  })

  describe('unauthenticated', () => {
    let client
    it('throws authorization error', async () => {
      client = new GraphQLClient(host)
      await expect(
        client.request(`mutation {
        report(
          description: "I don't like this user",
          resource: {
            id: "u2",
            type: user
          }
        ) { id, createdAt }
      }`)
      ).rejects.toThrow('Not Authorised')
    })

    describe('authenticated', () => {
      let headers
      let response
      beforeEach(async () => {
        headers = await login({ email: 'test@example.org', password: '1234' })
        client = new GraphQLClient(host, { headers })
        response = await client.request(`mutation {
          report(
            description: "I don't like this user",
            resource: {
              id: "u2",
              type: user
            }
            ) { id, createdAt }
          }`,
        { headers }
        )
      })
      it('creates a report', () => {
        let { id, createdAt } = response.report
        expect(response).toEqual({
          report: { id, createdAt }
        })
      })
    })
  })
})
