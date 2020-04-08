const dotenv = require('dotenv')

process.env.NODE_ENV = process.env.NODE_ENV || 'development'

const envFound = dotenv.config()
if (!envFound) throw new Error("⚠️  Couldn't find .env file")

module.exports = {
  port: process.env.PORT,
  projectId: process.env.PROJECT_ID,
  line: {
    channelAccessToken: process.env.DEV_CHANNEL_TOKEN,
    channelSecret: process.env.DEV_CHANNEL_SECRET,
  },
}
