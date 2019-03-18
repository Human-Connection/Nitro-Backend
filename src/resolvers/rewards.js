export default {
  Mutation: {
    reward: async (_object, params, context, _resolveInfo) => {
      const { fromBadgeId, toUserId } = params

      let ret = null

      const session = context.driver.session()

      let sessionRes = await session.run(
        'MATCH (badge:Badge {id: $badgeId})-[:REWARDED]->(rewardedUser:User {id: $rewardedUserId}) ' +
        'RETURN rewardedUser {.id}', {
          badgeId: fromBadgeId,
          rewardedUserId: toUserId
        })
      const [responseQ] = sessionRes.records.map(record => {
        return record.get('rewardedUser')
      })
      session.close()

      if (!((responseQ === null) || (responseQ === undefined))) {
        ret = responseQ.id
      }

      if (ret === null) {
        sessionRes = await session.run(
          'MATCH (badge:Badge {id: $badgeId}), (rewardedUser:User {id: $rewardedUserId}) ' +
          'MERGE (badge)-[:REWARDED]->(rewardedUser) ' +
          'RETURN rewardedUser {.id}', {
            badgeId: fromBadgeId,
            rewardedUserId: toUserId
          })
        const [responseM] = sessionRes.records.map(record => {
          return record.get('rewardedUser')
        })

        if (!((responseM === null) || (responseM === undefined))) {
          ret = responseM.id
        }
      }

      session.close()

      return ret
    },
    unreward: async (_object, params, context, _resolveInfo) => {
      const { fromBadgeId, toUserId } = params

      let ret = null

      const session = context.driver.session()

      let sessionRes = await session.run(
        'MATCH (badge:Badge {id: $badgeId})-[reward:REWARDED]->(rewardedUser:User {id: $rewardedUserId}) ' +
        'DELETE reward ' +
        'RETURN rewardedUser {.id}', {
          badgeId: fromBadgeId,
          rewardedUserId: toUserId
        })
      const [responseD] = sessionRes.records.map(record => {
        return record.get('rewardedUser')
      })
      session.close()

      if (!((responseD === null) || (responseD === undefined))) {
        ret = responseD.id
      }

      session.close()

      return ret
    }
  }
}
