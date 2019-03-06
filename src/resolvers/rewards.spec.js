import Factory from '../seed/factories'
import { GraphQLClient } from 'graphql-request'
import { host, login } from '../jest/helpers'
// import { host } from '../jest/helpers'

const factory = Factory()

describe('rewards', () => {
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

  describe('RewardBadge', () => {
    // const mutation = `
    // mutation(
    //   $from: ID!
    //   $to: ID!
    // ) {
    //   AddUserBadges(from: {id: $from}, to: {id: $to}) {
    //     from { id }
    //   }
    // }
    // `
    const mutation = `
    mutation(
      $from: ID!
      $to: ID!
    ) {
      AddBadgeRewarded(from: {id: $from}, to: {id: $to}) {
        from { id }
        to { id }
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

    describe('authenticated admin', () => {
      let client
      beforeEach(async () => {
        const headers = await login({ email: 'admin@example.org', password: '1234' })
        client = new GraphQLClient(host, { headers })
      })

      it('rewards a badge to user', async () => {
        const variables = {
          from: 'b6',
          to: 'u1'
        }
        // const expected = {
        //   AddUserBadges: {
        //     from: {
        //       id: 'b6'
        //     }
        //   }
        // }
        const expected = {
          AddBadgeRewarded: {
            from: {
              id: 'b6'
            },
            to: {
              id: 'u1'
            }
          }
        }
        await expect(
          client.request(mutation, variables)
        ).resolves.toEqual(expected)
      })
      it('rewards a second different reward to same user', async () => {
        await factory.create('Badge', {
          id: 'b1',
          key: 'indiegogo_en_racoon',
          type: 'crowdfunding',
          status: 'permanent',
          icon: '/img/badges/indiegogo_en_racoon.svg'
        })
        const variables = {
          from: 'b1',
          to: 'u1'
        }
        // const expected = {
        //   AddUserBadges: {
        //     from: {
        //       id: 'b1'
        //     }
        //   }
        // }
        const expected = {
          AddBadgeRewarded: {
            from: {
              id: 'b1'
            },
            to: {
              id: 'u1'
            }
          }
        }
        await expect(
          client.request(mutation, variables)
        ).resolves.toEqual(expected)
      })
      it('fails to reward the first reward a second time', async () => {
        const variables = {
          from: 'b6',
          to: 'u1'
        }
        await expect(
          client.request(mutation, variables)
        ).rejects.toThrow('Not Authorised')
      })
    })

    describe('authenticated moderator', () => {
      const variables = {
        from: 'b6',
        to: 'u1'
      }
      let client
      beforeEach(async () => {
        const headers = await login({ email: 'moderator@example.org', password: '1234' })
        client = new GraphQLClient(host, { headers })
      })

      describe('rewards bage to user', () => {
        it('throws authorization error', async () => {
          await expect(
            client.request(mutation, variables)
          ).rejects.toThrow('Not Authorised')
        })
      })
    })
  })

  describe('RemoveReward', () => {
    beforeEach(async () => {
      await factory.relate('User', 'Badges', { from: 'b6', to: 'u1' })
    })
    const variables = {
      from: 'b6',
      to: 'u1'
    }
    const expected = {
      RemoveBadgeRewarded: {
        from: {
          id: 'b6'
        },
        to: {
          id: 'u1'
        }
      }
    }

    const mutation = `
      mutation(
        $from: ID!
        $to: ID!
      ) {
        RemoveBadgeRewarded(from: {id: $from}, to: {id: $to}) {
          from { id }
          to { id }
        }
      }
      `

    describe('unauthenticated', () => {
      let client

      it('throws authorization error', async () => {
        client = new GraphQLClient(host)
        await expect(
          client.request(mutation, variables)
        ).rejects.toThrow('Not Authorised')
      })
    })

    describe('authenticated admin', () => {
      let client
      beforeEach(async () => {
        const headers = await login({ email: 'admin@example.org', password: '1234' })
        client = new GraphQLClient(host, { headers })
      })

      it('removes a badge from user', async () => {
        await expect(
          client.request(mutation, variables)
        ).resolves.toEqual(expected)
      })
      it('fails to remove a not existing badge from user', async () => {
        await expect(
          client.request(mutation, variables)
        ).resolves.toEqual(expected)
        await expect(
          client.request(mutation, variables)
        ).rejects.toThrow('Not Authorised')
      })
    })

    describe('authenticated moderator', () => {
      let client
      beforeEach(async () => {
        const headers = await login({ email: 'moderator@example.org', password: '1234' })
        client = new GraphQLClient(host, { headers })
      })

      describe('removes bage from user', () => {
        it('throws authorization error', async () => {
          await expect(
            client.request(mutation, variables)
          ).rejects.toThrow('Not Authorised')
        })
      })
    })
  })
})
