const express = require("express")
const { activityRoutes } = require("./activity.routes")
const { applicationRoutes } = require("./application.routes")
const { authRoutes } = require("./auth.routes")
const { contactRoutes } = require("./contact.routes")
const { dashboardRoutes } = require("./dashboard.routes")
const { leaderboardRoutes } = require("./leaderboard.routes")
const { matchmakingRoutes } = require("./matchmaking.routes")
const { metadataRoutes } = require("./metadata.routes")
const { notificationRoutes } = require("./notification.routes")
const { projectRoutes } = require("./project.routes")
const { roleRoutes } = require("./role.routes")
const { savedProjectRoutes } = require("./savedProject.routes")
const { taskRoutes } = require("./task.routes")
const { userRoutes } = require("./user.routes")

const apiRoutes = express.Router()

apiRoutes.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "GroupHub API v1",
    data: {
      auth: {
        register: "POST /api/v1/auth/register",
        login: "POST /api/v1/auth/login",
        refresh: "POST /api/v1/auth/refresh",
        logout: "POST /api/v1/auth/logout",
        me: "GET /api/v1/auth/me",
      },
      users: {
        me: "GET /api/v1/users/me",
        updateMe: "PATCH /api/v1/users/me",
      },
      projects: {
        list: "GET /api/v1/projects",
        create: "POST /api/v1/projects",
        detail: "GET /api/v1/projects/:id",
      },
      applications: {
        mine: "GET /api/v1/applications/me",
        update: "PATCH /api/v1/applications/:id",
      },
      dashboard: "GET /api/v1/dashboard",
      contact: "POST /api/v1/contact",
    },
  })
})

apiRoutes.use("/activity", activityRoutes)
apiRoutes.use("/applications", applicationRoutes)
apiRoutes.use("/auth", authRoutes)
apiRoutes.use("/contact", contactRoutes)
apiRoutes.use("/dashboard", dashboardRoutes)
apiRoutes.use("/leaderboard", leaderboardRoutes)
apiRoutes.use("/metadata", metadataRoutes)
apiRoutes.use("/notifications", notificationRoutes)
apiRoutes.use("/projects", projectRoutes)
apiRoutes.use("/roles", roleRoutes)
apiRoutes.use("/saved-projects", savedProjectRoutes)
apiRoutes.use("/tasks", taskRoutes)
apiRoutes.use("/users", userRoutes)
apiRoutes.use("/matchmaking", matchmakingRoutes)

module.exports = { apiRoutes }
