const express = require("express")
const {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} = require("../controllers/notification.controller")
const { authMiddleware } = require("../middlewares/auth.middleware")
const { validate } = require("../middlewares/validate.middleware")
const { notificationIdSchema } = require("../validators/notification.validator")

const notificationRoutes = express.Router()

notificationRoutes.use(authMiddleware)

notificationRoutes.get("/", listNotifications)
notificationRoutes.patch("/read-all", markAllNotificationsRead)
notificationRoutes.patch("/:id/read", validate(notificationIdSchema), markNotificationRead)

module.exports = { notificationRoutes }
