const { detectIntent, clearContext } = require('../dialogflow')
const { handleIntent } = require('../intent')

//Initialize replyMsg and messagelog object
const replyMsg = { type: 'text' }
const messagelog = {}

const handleMessage = async (event, client, userObject) => {
  const userID = userObject.userID
  const replyToken = event.replyToken
  //check message type from user
  if (event.message.type !== 'text') {
    messagelog.user = 'Non-Text Format'
    replyMsg.text = 'Only text input!'
    messagelog.bot = replyMsg.text
    await client.replyMessage(replyToken, replyMsg)
    return messagelog
  }
  const userMsg = event.message.text
  //add user message to messagelog.user
  messagelog.user = userMsg
  //if user input is clear, it will clear dialogflow context.
  if (userMsg === '/clear') {
    replyMsg.text = 'Clear Context!'
    messagelog.bot = replyMsg.text
    await clearContext(userID)
    await client.replyMessage(replyToken, replyMsg)
    return messagelog
  }

  // detect intent and get intentResponse
  const intentResponse = await detectIntent(userID, userMsg, 'en-US')

  //handleIntent and return bot answer to messagelog.bot
  messagelog.bot = await handleIntent(intentResponse, userObject, client, replyToken)
  return messagelog
}

module.exports = {
  handleMessage,
}