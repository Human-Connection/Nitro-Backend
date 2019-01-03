import { request } from 'graphql-request'
import createServer from './server'
import mocks from './mocks'
import { create, cleanDatabase } from './seed/factories'
import jwt from 'jsonwebtoken'

let getHost
let app
let port

beforeEach(async (done) => {
  const server = createServer({ mocks })
  app = await server.start({ port: 0 })
  port = app.address().port
  getHost = () => `http://127.0.0.1:${port}`
  done()
})

afterAll(async (done) => {
  await app.close()
  done()
})

describe.only('login', () => {
  const mutation = (params) => {
    const { email, password } = params
    return `
      mutation {
        login(email:"${email}", password:"${password}"){
          token
        }
      }`
  }

  describe('given an existing user', () => {
    beforeEach(async (done) => {
      await create('user', {
        email: 'test@example.org',
        password: '1234'
      })
      done()
    })

    afterEach(async (done) => {
      await cleanDatabase()
      done()
    })

    describe('asking for a `token`', () => {
      describe('with valid email/password combination', () => {
        it('responds with a JWT token', async (done) => {
          const data = await request(getHost(), mutation({ email: 'test@example.org', password: '1234' }))
          const { token } = data.login
          jwt.verify(token, process.env.JWT_SECRET, (err, data) => {
            expect(data.email).toEqual('test@example.org')
            expect(err).toBeNull()
            done()
          })
        })
      })

      describe('with a valid email but incorrect password', () => {
        it('responds with "Incorrect email address or password."', async (done) => {
          try {
            await request(getHost(), mutation({ email: 'test@example.org', password: 'wrong' }))
          } catch (error) {
            expect(error.response.errors[0].message).toEqual('Incorrect email address or password.')
            done()
          }
        })
      })

      describe('with a non-existing email', () => {
        it('responds with "Incorrect email address or password."', async (doen) => {
          try {
            await request(getHost(), mutation({ email: 'non-existent@example.org', password: 'wrong' }))
          } catch (error) {
            expect(error.response.errors[0].message).toEqual('Incorrect email address or password.')
            done()
          }
        })
      })
    })
  })
})