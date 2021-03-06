const { detectIntent, clearContext } = require('../dialogflow')
const { generateHomeworkJSON, generateNotesJSON, generateExamMessageJSON } = require('../functions')
const { getAllHomework, getAllNotes, getAllExams } = require('../../model/functions')
const { JSONfile } = require('../../json/JSONcontroller')

const handlePostback = async (event, client, userObject) => {
	//Initialize replyMsg and postbacklog
	const replyMsg = { type: 'text' }
	const date = { type: 'text' }
	const postbacklog = { data: {} }
	const postback = event.postback
	const userID = userObject.userID
	const replyToken = event.replyToken
	let intentResponse = {}
	let query = {}
	//Split data from postback.data by '/' to make a decision
	const data = postback.data.split('/')
	console.log(data)
	switch (data[0]) {
		case 'deadline':
			date.text = postback.params.datetime
			//detectIntent by dialogflow API and get response in intentResponse
			intentResponse = await detectIntent(userID, date.text, 'en-US')
			query = intentResponse.queryResult
			replyMsg.text = query.fulfillmentText
			postbacklog.type = 'message'
			postbacklog.data.bot = date.text
			await client.replyMessage(replyToken, [date, replyMsg])
			break
		case 'examDate':
			date.text = postback.params.datetime
			intentResponse = await detectIntent(userID, date.text, 'en-US')
			query = intentResponse.queryResult
			replyMsg.text = query.fulfillmentText
			postbacklog.type = 'message'
			postbacklog.data.bot = replyMsg.text
			await client.replyMessage(replyToken, [date, replyMsg])
			break
		case 'richmenu':
			await clearContext(userID)
			switch (data[1]) {
				case 'homework':
					//Generate reply JSON from homework collection
					const payloadJSON = await generateHomeworkJSON(await getAllHomework())
					await client.replyMessage(replyToken, payloadJSON)
					break
				case 'notes':
					const notesList = await generateNotesJSON(await getAllNotes())
					await client.replyMessage(replyToken, notesList)
					break
				case 'feedback':
					intentResponse = await detectIntent(userID, data[1], 'en-US')
					replyMsg.text = 'Feedback JSON'
					await client.replyMessage(replyToken, JSONfile('feedback'))
					break
				case 'exams':
					const examJSON = generateExamMessageJSON(await getAllExams())
					replyMsg.text = 'Exam JSON'
					await client.replyMessage(replyToken, examJSON)
					break
				default:
					replyMsg.text = data[1].toUpperCase() + ' function is not available yet.'
					await client.replyMessage(replyToken, replyMsg)
					break
			}
			postbacklog.type = 'richmenu'
			postbacklog.data.label = data[1]
			break
		default:
			postbacklog.type = 'click'
			postbacklog.data.function = data[0]
			postbacklog.data.area = data[1]
			postbacklog.data.label = data[2]
			break
	}
	return postbacklog
}
module.exports = {
	handlePostback,
}
