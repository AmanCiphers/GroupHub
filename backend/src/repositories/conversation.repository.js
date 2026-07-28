const { Conversation } = require("../models/Conversation")

async function findById(id) {
  return Conversation.findById(id)
}

async function isParticipant(conversationId, userId) {
  const conversation = await Conversation.findById(conversationId).select("type participants projectId").lean()
  if (!conversation) return false
  if (conversation.type === "dm") {
    return conversation.participants.some((p) => String(p) === String(userId))
  }
  const membership = require("mongoose").model("ProjectMembership")
  const active = await membership.findOne({ projectId: conversation.projectId, userId, status: "active" }).select("_id").lean()
  return !!active
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
  isParticipant,
}

module.exports = { conversationRepository }
