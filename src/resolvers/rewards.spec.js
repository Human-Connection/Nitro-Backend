import Factory from '../seed/factories'
import { GraphQLClient } from 'graphql-request'
import { host, login } from '../jest/helpers'
// import { host } from '../jest/helpers'

const factory = Factory()

describe('reward', () => {
  beforeEach(async () => {
    await factory.create('User', {
      id: 'u1',
      role: 'user',
      email: 'user@example.org',
      password: '1234'
    })
    await factory.create('User', {
      id: 'u2',
      role: 'moderator',
      email: 'moderator@example.org'
    })
    await factory.create('User', {
      id: 'u3',
      role: 'admin',
      email: 'admin@example.org'
    })
    await factory.create('Badge', {
      id: 'b6',
      key: 'indiegogo_en_rhino',
      type: 'crowdfunding',
      status: 'permanent',
      icon: '/img/badges/indiegogo_en_rhino.svg'
    })
  })

  afterEach(async () => {
    await factory.cleanDatabase()
  })

  const mutation = `
  mutation(
    $from: ID!
    $to: ID!
  ) {
    AddUserBadges(from: {id: $from}, to: {id: $to}) {
      from { id }
    }
  }
  `
  // const mutation = `
  // mutation(
  //   $from: ID!
  //   $to: ID!
  // ) {
  //   reward(
  //     badgeId: $from,
  //     userId: $to
  //   ) { id, createdAt }
  // }
  // `

  describe('unauthenticated', () => {
    const variables = {
      from: 'b6',
      to: 'u1'
    }
    let client

    it('throws authorization error', async () => {
      client = new GraphQLClient(host)
      await expect(
        client.request(mutation, variables)
      ).rejects.toThrow('Not Authorised')
    })
  })

  describe('role admin rewards bage to user', () => {
    const variables = {
      from: 'b6',
      to: 'u1'
    }

    describe('authenticated admin', () => {
      let client
      beforeEach(async () => {
        const headers = await login({ email: 'admin@example.org', password: '1234' })
        client = new GraphQLClient(host, { headers })
      })
      it('creates a reward', async () => {
        // const expected = {
        //   AddUserBadges: {
        //     from: {
        //       id: 'b6'
        //     }
        //   }
        // }
        const expected = {
          AddUserBadges: {
            from: {
              id: 'b6'
            }
          }
        }
        await expect(client.request(mutation, variables)).resolves.toEqual(expected)
      })
    })
  })

  describe('role moderator rewards bage to user', () => {
    const variables = {
      from: 'b6',
      to: 'u1'
    }

    describe('authenticated moderator', () => {
      let client
      beforeEach(async () => {
        const headers = await login({ email: 'moderator@example.org', password: '1234' })
        client = new GraphQLClient(host, { headers })
      })

      it('throws authorization error', async () => {
        await expect(
          client.request(mutation, variables)
        ).rejects.toThrow('Not Authorised')
      })
    })
  })

  // describe('UpdateBadge', () => {
  //   beforeEach(async () => {
  //     await factory.authenticateAs({ email: 'admin@example.org', password: '1234' })
  //     await factory.create('Badge', { id: 'b1' })
  //   })
  //   const variables = {
  //     id: 'b1',
  //     key: 'whatever'
  //   }

  //   const mutation = `
  //     mutation($id: ID!, $key: String!) {
  //       UpdateBadge(id: $id, key: $key) {
  //         id
  //         key
  //       }
  //     }
  //   `

  //   describe('unauthenticated', () => {
  //     let client

  //     it('throws authorization error', async () => {
  //       client = new GraphQLClient(host)
  //       await expect(
  //         client.request(mutation, variables)
  //       ).rejects.toThrow('Not Authorised')
  //     })
  //   })

  //   describe('authenticated moderator', () => {
  //     let client
  //     beforeEach(async () => {
  //       const headers = await login({ email: 'moderator@example.org', password: '1234' })
  //       client = new GraphQLClient(host, { headers })
  //     })

  //     it('throws authorization error', async () => {
  //       await expect(
  //         client.request(mutation, variables)
  //       ).rejects.toThrow('Not Authorised')
  //     })
  //   })

  //   describe('authenticated admin', () => {
  //     let client
  //     beforeEach(async () => {
  //       const headers = await login({ email: 'admin@example.org', password: '1234' })
  //       client = new GraphQLClient(host, { headers })
  //     })
  //     it('updates a badge', async () => {
  //       const expected = {
  //         UpdateBadge: {
  //           id: 'b1',
  //           key: 'whatever'
  //         }
  //       }
  //       await expect(client.request(mutation, variables)).resolves.toEqual(expected)
  //     })
  //   })
  // })

  // describe('DeleteBadge', () => {
  //   beforeEach(async () => {
  //     await factory.authenticateAs({ email: 'admin@example.org', password: '1234' })
  //     await factory.create('Badge', { id: 'b1' })
  //   })
  //   const variables = {
  //     id: 'b1'
  //   }

  //   const mutation = `
  //     mutation($id: ID!) {
  //       DeleteBadge(id: $id) {
  //         id
  //       }
  //     }
  //   `

  //   describe('unauthenticated', () => {
  //     let client

  //     it('throws authorization error', async () => {
  //       client = new GraphQLClient(host)
  //       await expect(
  //         client.request(mutation, variables)
  //       ).rejects.toThrow('Not Authorised')
  //     })
  //   })

  //   describe('authenticated moderator', () => {
  //     let client
  //     beforeEach(async () => {
  //       const headers = await login({ email: 'moderator@example.org', password: '1234' })
  //       client = new GraphQLClient(host, { headers })
  //     })

  //     it('throws authorization error', async () => {
  //       await expect(
  //         client.request(mutation, variables)
  //       ).rejects.toThrow('Not Authorised')
  //     })
  //   })

//   describe('authenticated admin', () => {
  //     let client
  //     beforeEach(async () => {
  //       const headers = await login({ email: 'admin@example.org', password: '1234' })
  //       client = new GraphQLClient(host, { headers })
  //     })
  //     it('deletes a badge', async () => {
  //       const expected = {
  //         DeleteBadge: {
  //           id: 'b1'
  //         }
  //       }
  //       await expect(client.request(mutation, variables)).resolves.toEqual(expected)
  //     })
  //   })
  // })
})
