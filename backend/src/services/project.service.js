const { projectRepository } = require("../repositories/project.repository")
const { roleRepository } = require("../repositories/role.repository")
const { membershipRepository } = require("../repositories/membership.repository")
const { savedProjectRepository } = require("../repositories/savedProject.repository")
const { activityService } = require("./activity.service")
const { ApiError } = require("../utils/ApiError")
const { getPagination } = require("../utils/pagination")
const { normalizeStringList } = require("../utils/normalize")
const { slugify } = require("../utils/slugify")

function serializeProject(project, roles = [], savedIds = []) {
  const projectId = String(project._id)

  return {
    id: projectId,
    ownerId: String(project.ownerId),
    title: project.title,
    slug: project.slug,
    description: project.description,
    category: project.category,
    stage: project.stage,
    commitmentHoursPerWeek: project.commitmentHoursPerWeek,
    commitmentLabel: project.commitmentLabel,
    locationType: project.locationType,
    location: project.location,
    status: project.status,
    visibility: project.visibility,
    skills: project.skills,
    tags: project.tags,
    teamSizeTarget: project.teamSizeTarget,
    progressPercent: project.progressPercent,
    nextMilestone: project.nextMilestone,
    roles: roles.map((role) => serializeRole(role)),
    isSaved: savedIds.includes(projectId),
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  }
}

function serializeRole(role) {
  return {
    id: String(role._id),
    projectId: String(role.projectId),
    title: role.title,
    description: role.description,
    requiredSkills: role.requiredSkills,
    preferredSkills: role.preferredSkills,
    slotsTotal: role.slotsTotal,
    slotsFilled: role.slotsFilled,
    slotsOpen: Math.max(role.slotsTotal - role.slotsFilled, 0),
    status: role.status,
    workloadHoursPerWeek: role.workloadHoursPerWeek,
  }
}

async function uniqueSlug(title) {
  const base = slugify(title)
  let slug = base
  let suffix = 2

  while (await projectRepository.findByIdOrSlug(slug)) {
    slug = `${base}-${suffix}`
    suffix += 1
  }

  return slug
}

function normalizeProjectPayload(payload) {
  return {
    title: payload.title.trim(),
    description: payload.description.trim(),
    category: payload.category.trim(),
    stage: payload.stage,
    commitmentHoursPerWeek: payload.commitmentHoursPerWeek || 0,
    commitmentLabel: payload.commitmentLabel?.trim() || "",
    locationType: payload.locationType || "remote",
    location: payload.location?.trim() || "Remote",
    status: payload.status || "recruiting",
    visibility: payload.visibility || "public",
    skills: normalizeStringList(payload.skills || []),
    tags: normalizeStringList(payload.tags || []),
    teamSizeTarget: payload.teamSizeTarget || 1,
    progressPercent: payload.progressPercent || 0,
    nextMilestone: payload.nextMilestone?.trim() || "",
  }
}

function normalizeRole(projectId, role) {
  return {
    projectId,
    title: role.title.trim(),
    description: role.description?.trim() || "",
    requiredSkills: normalizeStringList(role.requiredSkills || []),
    preferredSkills: normalizeStringList(role.preferredSkills || []),
    slotsTotal: role.slotsTotal || 1,
    workloadHoursPerWeek: role.workloadHoursPerWeek || 0,
  }
}

async function createProject(ownerId, payload) {
  const projectData = normalizeProjectPayload(payload)
  const project = await projectRepository.create({
    ...projectData,
    ownerId,
    slug: await uniqueSlug(projectData.title),
  })

  const rolePayloads = payload.roles.map((role) => normalizeRole(project._id, role))
  const roles = await roleRepository.createMany(rolePayloads)

  await membershipRepository.create({
    projectId: project._id,
    userId: ownerId,
    roleTitle: "Owner",
    permissions: ["view", "comment", "manage_roles", "manage_applications", "manage_project"],
  })

  await activityService.record({
    actorId: ownerId,
    projectId: project._id,
    type: "project_created",
    metadata: { title: project.title },
  })

  return serializeProject(project, roles)
}

async function listProjects(query, currentUserId) {
  const pagination = getPagination(query)
  const result = await projectRepository.list(query, pagination)
  const savedIds = currentUserId ? await savedProjectRepository.findIdsByUser(currentUserId) : []

  const roleLists = await Promise.all(
    result.items.map((project) => roleRepository.findByProject(project._id))
  )

  return {
    projects: result.items.map((project, index) => serializeProject(project, roleLists[index], savedIds)),
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: result.total,
      pages: Math.ceil(result.total / pagination.limit),
    },
  }
}

async function getProject(idOrSlug, currentUserId) {
  const project = await projectRepository.findByIdOrSlug(idOrSlug)

  if (!project || project.status === "archived") {
    throw new ApiError(404, "Project not found")
  }

  const [roles, savedIds, membership] = await Promise.all([
    roleRepository.findByProject(project._id),
    currentUserId ? savedProjectRepository.findIdsByUser(currentUserId) : [],
    currentUserId ? membershipRepository.findActive(project._id, currentUserId) : null,
  ])

  const result = serializeProject(project, roles, savedIds)
  result.isOwner = currentUserId ? String(project.ownerId) === String(currentUserId) : false
  result.isMember = !!membership
  return result
}

async function updateProject(projectId, userId, payload) {
  const project = await projectRepository.findById(projectId)

  if (!project) throw new ApiError(404, "Project not found")
  if (String(project.ownerId) !== String(userId)) {
    throw new ApiError(403, "Only the project owner can update this project")
  }

  const normalized = normalizeProjectPayload({ ...project.toObject(), ...payload })
  if (payload.status === "completed") normalized.progressPercent = 100
  const updated = await projectRepository.updateById(projectId, normalized)

  await activityService.record({
    actorId: userId,
    projectId,
    type: "project_updated",
    metadata: { title: updated.title },
  })

  const roles = await roleRepository.findByProject(projectId)
  return serializeProject(updated, roles)
}

async function archiveProject(projectId, userId) {
  return updateProject(projectId, userId, { status: "archived" })
}

const projectService = {
  archiveProject,
  createProject,
  getProject,
  listProjects,
  serializeProject,
  serializeRole,
  updateProject,
}

module.exports = { projectService }
