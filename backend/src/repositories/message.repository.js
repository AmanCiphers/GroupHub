const { Message } = require("../models/Message")

async function findByConversation(conversationId, limit = 50, before) {
  const filter = { conversationId }
  if (before) {
    filter.createdAt = { $lt: before }
  }
  return Message.find(filter)
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("senderId", "fullName username")
    .lean()
}

async function create(data) {
  return Message.create(data)
}

async function markRead(messageId, userId) {
  return Message.findByIdAndUpdate(messageId, {
    $addToSet: { readBy: userId },
  })
}

async function markAllRead(conversationId, userId) {
  return Message.updateMany(
    { conversationId, readBy: { $ne: userId } },
    { $addToSet: { readBy: userId } }
  )
}

async function countUnread(conversationId, userId) {
  return Message.countDocuments({
    conversationId,
    senderId: { $ne: userId },
    readBy: { $ne: userId },
  })
}

const messageRepository = {
  findByConversation,
  create,
  markRead,
  markAllRead,
  countUnread,
}

module.exports = { messageRepository }
