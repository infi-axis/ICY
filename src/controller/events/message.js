const { detectIntent, clearContext } = require('../dialogflow')
const { handleIntent } = require('../intent')
const { handleAdmin } = require('../admin')
const { JSONfile } = require('../../json/JSONcontroller')
const { generateRegularMessageJSON } = require('../functions')

const handleMessage = async (event, client, userObject) => {
	//Initialize replyMsg and messagelog object
	const replyMsg = { type: 'text' }
	const messagelog = {}
	const userID = userObject.userID
	const replyToken = event.replyToken
	//check message type from user
	if (event.message.type !== 'text') {
		messagelog.user = 'Non-Text Format'
		replyMsg.text = 'Only text input!'
		messagelog.bot = replyMsg.text
		await client.replyMessage(replyToken, JSONfile('text_only'))
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
		await client.replyMessage(replyToken, generateRegularMessageJSON(replyMsg.text))
		return messagelog
	}
	if (userMsg.charAt(0) === '/' && userMsg.length > 1) {
		if (userObject.isAdmin) messagelog.bot = await handleAdmin(event, client, userObject)
		else {
			replyMsg.text = "Sorry, I didn't get that!"
			messagelog.bot = replyMsg.text
			await client.replyMessage(replyToken, generateRegularMessageJSON(replyMsg.text))
		}
		return messagelog
	}
	let intentResponse = {}
	// detect intent and get intentResponse
	if (userMsg.length < 256) intentResponse = await detectIntent(userID, userMsg, 'en-US')
	else {
		intentResponse = await detectIntent(userID, 'Long message', 'en-US')
		messagelog.bot = await handleIntent(intentResponse, userObject, client, replyToken, userMsg)
		return messagelog
	}

	//handleIntent and return bot answer to messagelog.bot
	messagelog.bot = await handleIntent(intentResponse, userObject, client, replyToken)
	return messagelog
}

module.exports = {
	handleMessage,
}
