const { conversationRepository } = require("../repositories/conversation.repository")
const { messageRepository } = require("../repositories/message.repository")

async function getOrCreateProjectConversation(projectId) {
  let conversation = await conversationRepository.findByProject(projectId)
  if (!conversation) {
    conversation = await conversationRepository.create({
      type: "project",
      projectId,
      participants: [],
    })
  }
  return conversation
}

async function getOrCreateDM(userA, userB) {
  let conversation = await conversationRepository.findDM(userA, userB)
  if (!conversation) {
    conversation = await conversationRepository.create({
      type: "dm",
      participants: [userA, userB],
    })
  }
  return conversation
}

async function getConversations(userId) {
  return conversationRepository.findByParticipant(userId)
}

async function getMessages(conversationId, limit, before) {
  return messageRepository.findByConversation(conversationId, limit, before)
}

async function sendMessage(conversationId, senderId, text) {
  const message = await messageRepository.create({
    conversationId,
    senderId,
    text,
  })
  await conversationRepository.updateLastMessage(conversationId, text, senderId, message.createdAt)
  return message.populate("senderId", "fullName username")
}

async function markRead(conversationId, userId) {
  await messageRepository.markAllRead(conversationId, userId)
}

async function getUnreadCount(conversationId, userId) {
  return messageRepository.countUnread(conversationId, userId)
}

const chatService = {
  getOrCreateProjectConversation,
  getOrCreateDM,
  getConversations,
  getMessages,
  sendMessage,
  markRead,
  getUnreadCount,
}

module.exports = { chatService }
