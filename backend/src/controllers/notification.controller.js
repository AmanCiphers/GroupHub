const { notificationService } = require("../services/notification.service")
const { apiResponse } = require("../utils/ApiResponse")
const { asyncHandler } = require("../utils/asyncHandler")

const listNotifications = asyncHandler(async (req, res) => {
  const notifications = await notificationService.listForUser(req.user.id)
  apiResponse(res, 200, { notifications })
})

const markNotificationRead = asyncHandler(async (req, res) => {
  const notification = await notificationService.markRead(req.params.id, req.user.id)
  apiResponse(res, 200, { notification }, "Notification marked read")
})

const markAllNotificationsRead = asyncHandler(async (req, res) => {
  await notificationService.markAllRead(req.user.id)
  apiResponse(res, 200, null, "Notifications marked read")
})

module.exports = {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
}
