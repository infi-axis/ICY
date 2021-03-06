const Homework = require('./schema/Homework')
const User = require('./schema/User')
const Feedback = require('./schema/Feedback')
const Course = require('./schema/Course')
const Log = require('./schema/Log')
const Election = require('./schema/Election')
const Exam = require('./schema/Exam')
const Note = require('./schema/Note')

// Gets all homework documents, called with hw()
async function getAllHomework() {
	let obj = await Course.find({}, { _id: 0, title: 1, assignments: 1 })
	let arr = []
	for (let i = 0; i < obj.length; i++) {
		let subject = obj[i]
		if (subject.assignments.length) {
			for (let j = 0; j < subject.assignments.length; j++) {
				let data = await Homework.find({ _id: subject.assignments[j] }, { _id: 0 })
				if (!data.length) await Course.updateOne({ title: subject.title }, { $pull: { assignments: { $in: [subject.assignments[j]] } } })
				else subject.assignments[j] = data[0]
			}
			arr.push(subject)
		}
	}
	console.log(arr)
	return arr
}

async function getAllNotes() {
	let obj = await Course.find({}, { _id: 0, title: 1, notes: 1 })
	let arr = []
	for (let i = 0; i < obj.length; i++) {
		let subject = obj[i]
		if (subject.notes.length) {
			for (let j = 0; j < subject.notes.length; j++) {
				let data = await Note.find({ _id: subject.notes[j] }, { _id: 0 })
				if (!data.length) await Course.updateOne({ title: subject.title }, { $pull: { notes: { $in: [subject.notes[j]] } } })
				else subject.notes[j] = data[0]
			}
			arr.push(subject)
		}
	}
	console.log(arr)
	return arr
}

async function getAllExams() {
	let obj = await Course.find({}, { _id: 0, title: 1, examDates: 1 })
	let arr = []
	for (let i = 0; i < obj.length; i++) {
		let subject = obj[i]
		if (subject.examDates.length) {
			for (let j = 0; j < subject.examDates.length; j++) {
				let data = await Exam.find({ _id: subject.examDates[j] }, { _id: 0 })
				if (!data.length) await Course.updateOne({ title: subject.title }, { $pull: { examDates: { $in: [subject.examDates[j]] } } })
				else {
					let newObj = { title: subject.title, name: data[0].name, date: data[0].date, duration: data[0].duration }
					arr.push(newObj)
				}
			}
		}
	}
	console.log(arr)
	return arr
}

function getUserByID(userID) {
	return User.findOne({ userID })
}

async function getAllUsers() {
	return await User.find({})
}

function getAdminID() {
	return User.distinct('userID', { isAdmin: true })
}

async function getAllCourses() {
	return await Course.find({})
}

function getCourse(courseName) {
	return Course.findOne({ title: courseName })
}

function addCourse(courseName, id, examDates = [], notes = []) {
	return Course.create({ title: courseName, id, examDates, notes })
}

async function addNotes(subject, name, link, type, authorName, authorMajor) {
	let createObj = { name, link, type }
	if (type === 'Note') {
		createObj.author = { name: authorName, major: authorMajor }
	}
	let obj = await Note.create(createObj)
	return Course.findOneAndUpdate({ title: subject }, { $push: { notes: obj._id } }, { upsert: true })
}

function addUser(userID, profileName) {
	return User.create({ userID, profileName, isAdmin: false })
}

function delUser(userID) {
	return User.deleteOne({ userID })
}

function addFeedback(userID, profileName, type, text) {
	return Feedback.create({ userID, profileName, type, text })
}

async function addHomework(subject, deadline, name, link, authorName, authorMajor) {
	let obj = await Homework.create({ name, deadline, link, author: { name: authorName, major: authorMajor } })
	return Course.findOneAndUpdate({ title: subject }, { $push: { assignments: obj._id } }, { upsert: true })
}

async function addExam(subject, name, date, duration) {
	const expireAt = date
	let obj = await Exam.create({ name, date, duration, expireAt })
	return Course.findOneAndUpdate({ title: subject }, { $push: { examDates: obj._id } }, { upsert: true })
}

function addLog(userID, profileName, type, data) {
	return Log.create({ userID, profileName, type, data })
}

function addVote(userID, profileName, vote) {
	return Election.create({ userID, profileName, vote })
}

function getVote(userID) {
	return Election.findOne({ userID })
}

module.exports = {
	getAllHomework,
	getUserByID,
	getAllUsers,
	getAllCourses,
	getAllNotes,
	getAllExams,
	getCourse,
	getAdminID,
	getVote,
	addHomework,
	addExam,
	addNotes,
	addUser,
	addFeedback,
	addLog,
	addCourse,
	addVote,
	delUser,
}
