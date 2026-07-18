const { Notification } = require("../models/Notification")

async function create(data) {
  return Notification.create(data)
}

async function findByUser(userId, limit = 20) {
  return Notification.find({ userId }).sort({ createdAt: -1 }).limit(limit)
}

async function countUnread(userId) {
  return Notification.countDocuments({ userId, readAt: { $exists: false } })
}

async function markRead(id, userId) {
  return Notification.findOneAndUpdate(
    { _id: id, userId },
    { readAt: new Date() },
    { new: true }
  )
}

async function markAllRead(userId) {
  return Notification.updateMany(
    { userId, readAt: { $exists: false } },
    { readAt: new Date() }
  )
}

const notificationRepository = {
  countUnread,
  create,
  findByUser,
  markAllRead,
  markRead,
}

module.exports = { notificationRepository }
