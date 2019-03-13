import { neo4jgraphql } from 'neo4j-graphql-js'
const { Client, RichEmbed } = require('discord.js')

export default {
  Mutation: {
    CreatePost: async (object, params, context, resolveInfo) => {
      const result = await neo4jgraphql(object, params, context, resolveInfo, false)

      const session = context.driver.session()
      await session.run(
        'MATCH (author:User {id: $userId}), (post:Post {id: $postId}) ' +
        'MERGE (post)<-[:WROTE]-(author) ' +
        'RETURN author', {
          userId: context.user.id,
          postId: result.id
        })
      session.close()
      
      const discordBot = new Client()
      discordBot.on("ready", () => {
        discordBot.user.setStatus('online')
        discordBot.user.setActivity('Posting feed', { type: 'PLAYING', url: process.env.APP_URL })
        const guild = discordBot.guilds.get(process.env.DISCORD_GUILD);
        const channel = guild.channels.get(process.env.DISCORD_CHANNEL)
        const content = result.contentExcerpt.replace(/<\/?[^>]+(>|$)/g, "")
        const image = null
        if(result.image != null) {
          image = result.image
        }
        const embed = new RichEmbed()
          .setTitle(result.title)
          .setColor(process.env.DISCORD_COLOR)
          .setDescription(content)
          .setAuthor(context.user.name, context.user.avatar, process.env.APP_URL + '/profile/' + context.user.slug)
          .setURL(process.env.APP_URL + '/post/' + result.slug)
          .addBlankField()
          .setImage(image)
          .setTimestamp()
          .setFooter(process.env.PROJECT_NAME + ' (' + process.env.PROJECT_STATUS + ')',  process.env.PROJECT_ICON)
        channel.send(embed)
        discordBot.user.setAFK(true)
      })
      discordBot.login(process.env.DISCORD_TOKEN)
      //throw new Exception()

      return result
    }
  }
}
