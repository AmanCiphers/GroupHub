const express = require("express")
const { listActivity, listProjectActivity } = require("../controllers/activity.controller")
const { authMiddleware } = require("../middlewares/auth.middleware")

const activityRoutes = express.Router()

activityRoutes.get("/", authMiddleware, listActivity)
activityRoutes.get("/project/:projectId", authMiddleware, listProjectActivity)

module.exports = { activityRoutes }
