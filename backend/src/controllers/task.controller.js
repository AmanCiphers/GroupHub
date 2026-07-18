const { taskService } = require("../services/task.service")
const { apiResponse } = require("../utils/ApiResponse")
const { asyncHandler } = require("../utils/asyncHandler")

const createTask = asyncHandler(async (req, res) => {
  const task = await taskService.createTask(req.params.projectId, req.user.id, req.validated.body)
  apiResponse(res, 201, { task }, "Task created")
})

const listTasks = asyncHandler(async (req, res) => {
  const tasks = await taskService.listTasks(req.params.projectId, req.user.id)
  apiResponse(res, 200, { tasks })
})

const getTask = asyncHandler(async (req, res) => {
  const task = await taskService.getTask(req.params.taskId, req.user.id)
  apiResponse(res, 200, { task })
})

const updateTask = asyncHandler(async (req, res) => {
  const task = await taskService.updateTask(req.params.taskId, req.user.id, req.validated.body)
  apiResponse(res, 200, { task }, "Task updated")
})

const deleteTask = asyncHandler(async (req, res) => {
  await taskService.deleteTask(req.params.taskId, req.user.id)
  apiResponse(res, 200, null, "Task deleted")
})

const getTaskStats = asyncHandler(async (req, res) => {
  const stats = await taskService.getTaskStats(req.params.projectId, req.user.id)
  apiResponse(res, 200, { stats })
})

const claimTask = asyncHandler(async (req, res) => {
  const task = await taskService.claimTask(req.params.taskId, req.user.id)
  apiResponse(res, 200, { task }, "Task claimed")
})

const sendFeedback = asyncHandler(async (req, res) => {
  const result = await taskService.sendFeedback(req.params.taskId, req.user.id, req.validated.body.feedback)
  apiResponse(res, 200, result, "Feedback sent")
})

const getSubtasks = asyncHandler(async (req, res) => {
  const subtasks = await taskService.getSubtasks(req.params.taskId, req.user.id)
  apiResponse(res, 200, { subtasks })
})

module.exports = { claimTask, createTask, listTasks, getTask, updateTask, deleteTask, getTaskStats, sendFeedback, getSubtasks }
