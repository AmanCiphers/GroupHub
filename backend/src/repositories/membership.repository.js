const { ProjectMembership } = require("../models/ProjectMembership")

async function create(data) {
  return ProjectMembership.create(data)
}

async function findActive(projectId, userId) {
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

const membershipRepository = {
  countByUser,
  create,
  findActive,
  findByProject,
  findByUser,
}

module.exports = { membershipRepository }
