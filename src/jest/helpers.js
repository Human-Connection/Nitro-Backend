import { request } from 'graphql-request'

export const host = 'http://127.0.0.1:4123'

export async function authenticatedHeaders ({ email, password }) {
  const mutation = `
      mutation {
        login(email:"${email}", password:"${password}"){
          token
        }
      }`
  const response = await request(host, mutation)
  return {
    authorization: `Bearer ${response.login.token}`
  }
}
