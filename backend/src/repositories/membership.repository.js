const mongoose = require("mongoose")
const { ProjectMembership } = require("../models/ProjectMembership")

async function create(data) {
  return ProjectMembership.create(data)
}

async function findActive(projectId, userId) {
  if (!mongoose.Types.ObjectId.isValid(projectId) || !mongoose.Types.ObjectId.isValid(userId)) return null
  return ProjectMembership.findOne({ projectId, userId, status: "active" })
}

async function findByUser(userId) {
  return ProjectMembership.find({ userId, status: "active" })
    .populate("projectId", "title slug category status progressPercent nextMilestone")
    .sort({ joinedAt: -1 })
}

async function findByProject(projectId) {
  return ProjectMembership.find({ projectId, status: "active" })
    .populate("userId", "fullName email username bio skills avatar")
    .populate("roleId", "title")
    .sort({ joinedAt: -1 })
}

async function countByUser(userId) {
  return ProjectMembership.countDocuments({ userId, status: "active" })
}

async function findProjectIdsByUser(userId) {
  return ProjectMembership.find({ userId, status: "active" }).distinct("projectId")
}

async function findUserIdsByProject(projectId) {
  return ProjectMembership.find({ projectId, status: "active" }).distinct("userId")
}

async function updateById(id, data) {
  return ProjectMembership.findByIdAndUpdate(id, data, { new: true, runValidators: true })
}

const membershipRepository = {
  countByUser,
  create,
  findActive,
  findByProject,
  findByUser,
  findProjectIdsByUser,
  findUserIdsByProject,
  updateById,
}

module.exports = { membershipRepository }
