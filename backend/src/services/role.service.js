const { projectRepository } = require("../repositories/project.repository")
const { roleRepository } = require("../repositories/role.repository")
const { activityService } = require("./activity.service")
const { projectService } = require("./project.service")
const { ApiError } = require("../utils/ApiError")
const { normalizeStringList } = require("../utils/normalize")

function normalizeRolePayload(payload) {
  return {
    title: payload.title.trim(),
    description: payload.description?.trim() || "",
    requiredSkills: normalizeStringList(payload.requiredSkills || []),
    preferredSkills: normalizeStringList(payload.preferredSkills || []),
    slotsTotal: payload.slotsTotal || 1,
    workloadHoursPerWeek: payload.workloadHoursPerWeek || 0,
    status: payload.status || "open",
  }
}

async function createRole(projectId, userId, payload) {
  const project = await projectRepository.findById(projectId)

  if (!project) throw new ApiError(404, "Project not found")
  if (String(project.ownerId) !== String(userId)) {
    throw new ApiError(403, "Only the project owner can add roles")
  }

  const role = await roleRepository.create({
    ...normalizeRolePayload(payload),
    projectId,
  })

  await activityService.record({
    actorId: userId,
    projectId,
    type: "role_created",
    metadata: { title: role.title },
  })

  return projectService.serializeRole(role)
}

async function updateRole(roleId, userId, payload) {
  const role = await roleRepository.findById(roleId)
  if (!role) throw new ApiError(404, "Role not found")

  const project = await projectRepository.findById(role.projectId)
  if (!project) throw new ApiError(404, "Project not found")
  if (String(project.ownerId) !== String(userId)) {
    throw new ApiError(403, "Only the project owner can update roles")
  }

  const updated = await roleRepository.updateById(roleId, normalizeRolePayload({ ...role.toObject(), ...payload }))
  return projectService.serializeRole(updated)
}

async function closeRole(roleId, userId) {
  return updateRole(roleId, userId, { status: "closed" })
}

const roleService = {
  closeRole,
  createRole,
  updateRole,
}

module.exports = { roleService }
