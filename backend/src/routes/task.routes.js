const express = require("express")
const {
  claimTask,
  createTask,
  listTasks,
  getTask,
  updateTask,
  deleteTask,
  getTaskStats,
  sendFeedback,
  getSubtasks,
} = require("../controllers/task.controller")
const { authMiddleware } = require("../middlewares/auth.middleware")
const { validate } = require("../middlewares/validate.middleware")
const {
  createTaskSchema,
  updateTaskSchema,
  taskIdParamSchema,
  feedbackSchema,
} = require("../validators/task.validator")

const taskRoutes = express.Router()

taskRoutes.use(authMiddleware)

taskRoutes.get("/stats/:projectId", getTaskStats)
taskRoutes.get("/:projectId", listTasks)
taskRoutes.post("/:projectId", validate(createTaskSchema), createTask)
taskRoutes.get("/detail/:taskId", getTask)
taskRoutes.patch("/:taskId", validate(updateTaskSchema), updateTask)
taskRoutes.post("/:taskId/claim", claimTask)
taskRoutes.post("/:taskId/feedback", validate(feedbackSchema), sendFeedback)
taskRoutes.get("/:taskId/subtasks", getSubtasks)
taskRoutes.delete("/:taskId", validate(taskIdParamSchema), deleteTask)

module.exports = { taskRoutes }
