const { Conversation } = require("../models/Conversation")

async function findById(id) {
  return Conversation.findById(id)
}

async function findByProject(projectId) {
  return Conversation.findOne({ projectId, type: "project" })
}

async function findDM(userA, userB) {
  const [a, b] = [userA, userB].sort()
  return Conversation.findOne({
    type: "dm",
    participants: { $all: [a, b], $size: 2 },
  })
}

async function findByParticipant(userId) {
  return Conversation.find({ participants: userId })
    .sort({ "lastMessage.sentAt": -1 })
    .populate("participants", "fullName username")
    .populate("lastMessage.senderId", "fullName")
    .lean()
}

async function create(data) {
  return Conversation.create(data)
}

async function updateLastMessage(conversationId, text, senderId, sentAt) {
  return Conversation.findByIdAndUpdate(conversationId, {
    lastMessage: { text, senderId, sentAt },
  })
}

const conversationRepository = {
  findById,
  findByProject,
  findDM,
  findByParticipant,
  create,
  updateLastMessage,
}

module.exports = { conversationRepository }
