const express = require("express")
const { leaveProject, removeMember } = require("../controllers/membership.controller")
const { authMiddleware } = require("../middlewares/auth.middleware")

const membershipRoutes = express.Router()

membershipRoutes.use(authMiddleware)

membershipRoutes.post("/:projectId/leave", leaveProject)
membershipRoutes.delete("/:projectId/members/:userId", removeMember)

module.exports = { membershipRoutes }
