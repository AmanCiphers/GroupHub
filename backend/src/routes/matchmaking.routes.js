const { Router } = require("express")
const { authMiddleware } = require("../middlewares/auth.middleware")
const { recommendProjects, recommendMembers } = require("../controllers/matchmaking.controller")

const matchmakingRoutes = Router()

matchmakingRoutes.use(authMiddleware)

matchmakingRoutes.get("/projects", recommendProjects)
matchmakingRoutes.get("/members/:projectId", recommendMembers)

module.exports = { matchmakingRoutes }
