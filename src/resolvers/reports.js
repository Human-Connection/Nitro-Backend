import uuid from 'uuid/v4'

export default {
  Mutation: {
    report: async (parent, { id, description }, { driver, req, user }, resolveInfo) => {
      const reportId = uuid()
      const session = driver.session()
      const reportData = {
        id: reportId,
        createdAt: (new Date()).toISOString(),
        description: description
      }

      const res = await session.run(`
        MATCH (submitter:User {id: $userId})
        MATCH (resource {id: $resourceId})
        WHERE resource:User OR resource:Comment OR resource:Post
        CREATE (report:Report $reportData)
        MERGE (resource)<-[:REPORTED]-(report)
        MERGE (report)<-[:REPORTED]-(submitter)
        RETURN report, submitter, resource, labels(resource)[0] as type
        `, {
        resourceId: id,
        userId: user.id,
        reportData
      }
      )
      session.close()

      const [dbResponse] = res.records.map(r => {
        return {
          report: r.get('report'),
          submitter: r.get('submitter'),
          resource: r.get('resource'),
          type: r.get('type')
        }
      })
      if (!dbResponse) return null
      const { report, submitter, resource, type } = dbResponse

      let response = {
        ...report.properties,
        post: null,
        comment: null,
        user: null,
        submitter: submitter.properties,
        type
      }
      switch (type) {
      case 'Post':
        response.post = resource.properties
        break
      case 'Comment':
        response.comment = resource.properties
        break
      case 'User':
        response.user = resource.properties
        break
      }
      return response
    }
  }
}
