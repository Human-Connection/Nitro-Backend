import { request } from 'graphql-request'
import { create, cleanDatabase } from './seed/factories'
import jwt from 'jsonwebtoken'
import { host } from './jest/helpers'

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

  describe('given an existing user', () => {
    beforeEach(async () => {
      await create('user', {
        email: 'test@example.org',
        password: '1234'
      })
    })

    afterEach(async () => {
      await cleanDatabase()
    })

    describe('asking for a `token`', () => {
      describe('with valid email/password combination', () => {
        it('responds with a JWT token', async () => {
          const data = await request(host, mutation({ email: 'test@example.org', password: '1234' }))
          const { token } = data.login
          jwt.verify(token, process.env.JWT_SECRET, (err, data) => {
            expect(data.email).toEqual('test@example.org')
            expect(err).toBeNull()
          })
        })
      })

      describe('with a valid email but incorrect password', () => {
        it('responds with "Incorrect email address or password."', async () => {
          try {
            await request(host, mutation({ email: 'test@example.org', password: 'wrong' }))
          } catch (error) {
            expect(error.response.errors[0].message).toEqual('Incorrect email address or password.')
          }
        })
      })

      describe('with a non-existing email', () => {
        it('responds with "Incorrect email address or password."', async () => {
          try {
            await request(host, mutation({ email: 'non-existent@example.org', password: 'wrong' }))
          } catch (error) {
            expect(error.response.errors[0].message).toEqual('Incorrect email address or password.')
          }
        })
      })
    })
  })
})
