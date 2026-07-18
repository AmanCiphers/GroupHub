const { notificationRepository } = require("../repositories/notification.repository")

async function notify(data) {
  return notificationRepository.create(data)
}

async function listForUser(userId) {
  return notificationRepository.findByUser(userId)
}

async function unreadCount(userId) {
  return notificationRepository.countUnread(userId)
}

async function markRead(id, userId) {
  return notificationRepository.markRead(id, userId)
}

async function markAllRead(userId) {
  return notificationRepository.markAllRead(userId)
}

const notificationService = {
  listForUser,
  markAllRead,
  markRead,
  notify,
  unreadCount,
}

module.exports = { notificationService }
