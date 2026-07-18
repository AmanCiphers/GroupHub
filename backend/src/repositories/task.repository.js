const { Task } = require("../models/Task")

async function create(data) {
  return Task.create(data)
}

async function findById(id) {
  return Task.findById(id)
    .populate("assigneeId", "fullName email username")
    .populate("createdBy", "fullName")
}

async function findByProject(projectId) {
  return Task.find({ projectId })
    .populate("assigneeId", "fullName email username")
    .populate("createdBy", "fullName")
    .sort({ createdAt: -1 })
}

async function findByParent(parentId) {
  return Task.find({ parentId })
    .populate("assigneeId", "fullName email username")
    .populate("createdBy", "fullName")
    .sort({ createdAt: -1 })
}

async function updateById(id, data) {
  return Task.findByIdAndUpdate(id, data, { new: true, runValidators: true })
}

async function removeById(id) {
  return Task.findByIdAndDelete(id)
}

async function countByProject(projectId, status) {
  const filter = { projectId }
  if (status) filter.status = status
  return Task.countDocuments(filter)
}

const taskRepository = {
  create,
  findById,
  findByProject,
  findByParent,
  updateById,
  removeById,
  countByProject,
}

module.exports = { taskRepository }
