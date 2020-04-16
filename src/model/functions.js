const Homework = require('./schema/Homework')
const User = require('./schema/User')
const Feedback = require('./schema/Feedback')
const Course = require('./schema/Course')
const Log = require('./schema/Log')
const Election = require('./schema/Election')

// Gets all homework documents, called with hw()
async function getAllHomework() {
  return await Homework.find({})
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

function addCourse(courseName, code, examDates = [], notes = []) {
  return Course.create({ title: courseName, code, examDates, notes })
}

function addNotes(subject, filename, link) {
  const notes = { name: filename, link } // plural name so it can use ES6 destructure
  return Course.findOneAndUpdate({ title: subject }, { $push: { notes } }, { upsert: true })
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

function addHomework(subject, deadline, name, link) {
  const assignments = { name, deadline, link } // plural name so it can use ES6 destructure
  return Homework.findOneAndUpdate({ title: subject }, { $push: { assignments } }, { upsert: true })
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
  getCourse,
  getAdminID,
  getVote,
  addHomework,
  addNotes,
  addUser,
  addFeedback,
  addLog,
  addCourse,
  addVote,
  delUser,
}
