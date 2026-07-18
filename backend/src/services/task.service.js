const { taskRepository } = require("../repositories/task.repository")
const { projectRepository } = require("../repositories/project.repository")
const { ApiError } = require("../utils/ApiError")

function serializeTask(task) {
  return {
    id: String(task._id),
    projectId: String(task.projectId),
    parentId: task.parentId ? String(task.parentId) : null,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    dueDate: task.dueDate,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
    assignee: task.assigneeId
      ? {
          id: String(task.assigneeId._id || task.assigneeId),
          fullName: task.assigneeId.fullName,
          email: task.assigneeId.email,
          username: task.assigneeId.username,
        }
      : null,
    createdBy: task.createdBy?.fullName || null,
    assignmentType: task.assignmentType || "assigned",
    reviewNote: task.reviewNote || "",
  }
}

async function ensureProjectOwner(projectId, userId) {
  const project = await projectRepository.findById(projectId)
  if (!project) throw new ApiError(404, "Project not found")
  if (String(project.ownerId) !== String(userId)) {
    throw new ApiError(403, "Only the project owner can manage tasks")
  }
  return project
}

async function ensureProjectMemberOrOwner(projectId, userId) {
  const project = await projectRepository.findById(projectId)
  if (!project) throw new ApiError(404, "Project not found")
  const isOwner = String(project.ownerId) === String(userId)
  if (isOwner) return project
  const { membershipService } = require("./membership.service")
  const isMember = await membershipService.isProjectMember(projectId, userId)
  if (!isMember) throw new ApiError(403, "Only project members can view tasks")
  return project
}

async function recalcProgress(projectId) {
  const project = await projectRepository.findById(projectId)
  if (!project) return
  if (project.status === "completed") {
    await projectRepository.updateById(projectId, { progressPercent: 100 })
    return
  }
  const [total, done] = await Promise.all([
    taskRepository.countByProject(projectId),
    taskRepository.countByProject(projectId, "done"),
  ])
  if (total === 0) return
  const pct = Math.min(Math.round((done / total) * 100), 90)
  await projectRepository.updateById(projectId, { progressPercent: pct })
}

async function createTask(projectId, userId, payload) {
  await ensureProjectOwner(projectId, userId)
  const isOpen = payload.assignmentType === "open"
  const task = await taskRepository.create({
    projectId,
    createdBy: userId,
    title: payload.title.trim(),
    description: payload.description?.trim() || "",
    assigneeId: isOpen ? null : (payload.assigneeId || null),
    assignmentType: payload.assignmentType || "assigned",
    status: payload.status || "todo",
    priority: payload.priority || "medium",
    dueDate: payload.dueDate || null,
  })
  await recalcProgress(projectId)
  return serializeTask(task)
}

async function listTasks(projectId, userId) {
  await ensureProjectMemberOrOwner(projectId, userId)
  const tasks = await taskRepository.findByProject(projectId)
  return tasks.map(serializeTask)
}

async function getTask(taskId, userId) {
  const task = await taskRepository.findById(taskId)
  if (!task) throw new ApiError(404, "Task not found")
  await ensureProjectMemberOrOwner(task.projectId, userId)
  return serializeTask(task)
}

async function updateTask(taskId, userId, payload) {
  const task = await taskRepository.findById(taskId)
  if (!task) throw new ApiError(404, "Task not found")

  const project = await projectRepository.findById(task.projectId)
  if (!project) throw new ApiError(404, "Project not found")
  const isOwner = String(project.ownerId) === String(userId)

  if (isOwner) {
    const updates = {}
    if (payload.title !== undefined) updates.title = payload.title.trim()
    if (payload.description !== undefined) updates.description = payload.description.trim()
    if (payload.status !== undefined) updates.status = payload.status
    if (payload.priority !== undefined) updates.priority = payload.priority
    if (payload.assignmentType !== undefined) {
      updates.assignmentType = payload.assignmentType
      if (payload.assignmentType === "open") updates.assigneeId = null
    }
    if (payload.assigneeId !== undefined) updates.assigneeId = payload.assigneeId || null
    if (payload.dueDate !== undefined) updates.dueDate = payload.dueDate || null
    if (payload.reviewNote !== undefined) updates.reviewNote = payload.reviewNote

    const updated = await taskRepository.updateById(taskId, updates)
    await recalcProgress(updated.projectId)
    return serializeTask(updated)
  }

  const { membershipService } = require("./membership.service")
  const isMember = await membershipService.isProjectMember(task.projectId, userId)
  if (!isMember) throw new ApiError(403, "Access denied")
  const assigneeId = task.assigneeId ? String(task.assigneeId._id || task.assigneeId) : null
  if (assigneeId !== String(userId)) throw new ApiError(403, "Only the assigned member can update this task")
  const allowedKeys = ["status"]
  const keys = Object.keys(payload || {})
  if (!keys.every((k) => allowedKeys.includes(k))) throw new ApiError(403, "Members can only update task status")

  const updated = await taskRepository.updateById(taskId, { status: payload.status })
  await recalcProgress(task.projectId)
  return serializeTask(updated)
}

async function deleteTask(taskId, userId) {
  const task = await taskRepository.findById(taskId)
  if (!task) throw new ApiError(404, "Task not found")
  await ensureProjectOwner(task.projectId, userId)
  await taskRepository.removeById(taskId)
  await recalcProgress(task.projectId)
}

async function claimTask(taskId, userId) {
  const { membershipService } = require("./membership.service")
  const task = await taskRepository.findById(taskId)
  if (!task) throw new ApiError(404, "Task not found")
  if (task.assignmentType !== "open") throw new ApiError(400, "Only open tasks can be claimed")
  if (task.assigneeId) throw new ApiError(400, "Task is already claimed")

  const isMember = await membershipService.isProjectMember(task.projectId, userId)
  if (!isMember) throw new ApiError(403, "Only project members can claim tasks")

  const updated = await taskRepository.updateById(taskId, { assigneeId: userId })
  await recalcProgress(task.projectId)
  return serializeTask(updated)
}

async function sendFeedback(taskId, userId, feedback) {
  const task = await taskRepository.findById(taskId)
  if (!task) throw new ApiError(404, "Task not found")

  const project = await projectRepository.findById(task.projectId)
  if (!project) throw new ApiError(404, "Project not found")
  if (String(project.ownerId) !== String(userId)) throw new ApiError(403, "Only the project owner can send feedback")

  if (task.status !== "needs_review") throw new ApiError(400, "Feedback can only be sent on tasks awaiting review")

  const assigneeId = task.assigneeId ? String(task.assigneeId._id || task.assigneeId) : null
  if (!assigneeId) throw new ApiError(400, "Cannot send feedback on unassigned tasks")

  const child = await taskRepository.create({
    projectId: task.projectId,
    parentId: task._id,
    createdBy: userId,
    title: task.title,
    description: `**Feedback from review:**\n${feedback}\n\n---\n**Original description:**\n${task.description}`,
    assigneeId,
    assignmentType: "assigned",
    status: "todo",
    priority: task.priority,
    dueDate: task.dueDate,
    reviewNote: feedback,
  })

  await taskRepository.updateById(taskId, { status: "done" })
  await recalcProgress(task.projectId)

  return { parent: serializeTask({ ...task.toObject(), status: "done" }), child: serializeTask(child) }
}

async function getSubtasks(taskId, userId) {
  const task = await taskRepository.findById(taskId)
  if (!task) throw new ApiError(404, "Task not found")
  await ensureProjectMemberOrOwner(task.projectId, userId)

  const subtasks = await taskRepository.findByParent(taskId)
  return subtasks.map(serializeTask)
}

async function getTaskStats(projectId, userId) {
  await ensureProjectMemberOrOwner(projectId, userId)
  const [todo, inProgress, needsReview, done, cancelled] = await Promise.all([
    taskRepository.countByProject(projectId, "todo"),
    taskRepository.countByProject(projectId, "in_progress"),
    taskRepository.countByProject(projectId, "needs_review"),
    taskRepository.countByProject(projectId, "done"),
    taskRepository.countByProject(projectId, "cancelled"),
  ])
  return { todo, inProgress, needsReview, done, cancelled, total: todo + inProgress + needsReview + done + cancelled }
}

const taskService = {
  claimTask,
  createTask,
  listTasks,
  getTask,
  updateTask,
  deleteTask,
  getTaskStats,
  sendFeedback,
  getSubtasks,
}

module.exports = { taskService }
