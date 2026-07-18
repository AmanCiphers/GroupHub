const { membershipRepository } = require("../repositories/membership.repository")
const { projectRepository } = require("../repositories/project.repository")
const { ApiError } = require("../utils/ApiError")

function serializeMembership(m) {
  return {
    id: String(m._id),
    roleTitle: m.roleTitle || m.roleId?.title || "",
    joinedAt: m.joinedAt,
    permissions: m.permissions,
    user: m.userId
      ? {
          id: String(m.userId._id || m.userId),
          fullName: m.userId.fullName,
          email: m.userId.email,
          username: m.userId.username,
          bio: m.userId.bio,
          skills: m.userId.skills,
        }
      : null,
  }
}

async function isProjectMember(projectId, userId) {
  const membership = await membershipRepository.findActive(projectId, userId)
  return !!membership
}

async function listProjectMembers(projectId, userId) {
  const project = await projectRepository.findById(projectId)
  if (!project) throw new ApiError(404, "Project not found")
  const isOwner = String(project.ownerId) === String(userId)
  if (!isOwner && !(await isProjectMember(projectId, userId))) {
    throw new ApiError(403, "Only project members can view the team")
  }
  const members = await membershipRepository.findByProject(projectId)
  return members.map(serializeMembership)
}

const membershipService = {
  isProjectMember,
  listProjectMembers,
}

module.exports = { membershipService }
