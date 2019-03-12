import isEmpty from 'lodash/isEmpty'

export default {
  Mutation: {
    reward: async (parent, { userId, badgeId }, { driver, req, user }, resolveInfo) => {
      const session = driver.session()

      let data = {
        userId,
        badgeId,
        rewarderId: user.id,
        rewardedBy: null
      }

      let reward = await session.run(
        'MATCH (b:Badge {id: $badgeId})-[r:REWARDED]->(u:User {id: $userId}), (by:User {id: $rewarderId}) ' +
        'RETURN r.rewarderId, r.createdAt, by.role, by.deleted, by.name, by.disabled, by.avatar, by.id, by.slug', data
      )
      if (isEmpty(reward.records)) {
        reward = await session.run(
          'MATCH (u:User {id: $userId}), (b:Badge {id: $badgeId}), (by:User {id: $rewarderId}) ' +
          'MERGE (b)-[r:REWARDED {rewarderId: $rewarderId, createdAt: DateTime()}]->(u) ' +
          'RETURN r.rewarderId, r.createdAt, by.role, by.deleted, by.name, by.disabled, by.avatar, by.id, by.slug', data
        )
      }

      session.close()

      const [res] = reward.records.map(record => {
        return {
          rewarderId: record.get('r.rewarderId'),
          rewardedBy: {
            role: record.get('by.role'),
            deleted: record.get('by.deleted'),
            name: record.get('by.name'),
            disabled: record.get('by.disabled'),
            avatar: record.get('by.avatar'),
            id: record.get('by.id'),
            slug: record.get('by.slug')
          },
          createdAt: record.get('r.createdAt')
        }
      })
      data.rewarderId = res.rewarderId
      data.rewardedBy = res.rewardedBy
      data.createdAt = res.createdAt

      return {
        from: { id: badgeId },
        to: { id: userId },
        rewarderId: data.rewarderId,
        rewardedBy: data.rewardedBy,
        createdAt: data.createdAt
      }
    }
  }
}
