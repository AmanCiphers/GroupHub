const { applicationRepository } = require("../repositories/application.repository")
const { membershipRepository } = require("../repositories/membership.repository")
const { projectRepository } = require("../repositories/project.repository")
const { roleRepository } = require("../repositories/role.repository")
const { activityService } = require("./activity.service")
const { notificationService } = require("./notification.service")
const { ApiError } = require("../utils/ApiError")

function serializeApplication(application) {
  return {
    id: String(application._id),
    projectId: String(application.projectId?._id || application.projectId),
    roleId: String(application.roleId?._id || application.roleId),
    applicantId: String(application.applicantId?._id || application.applicantId),
    message: application.message,
    availabilityHoursPerWeek: application.availabilityHoursPerWeek,
    status: application.status,
    reviewedBy: application.reviewedBy ? String(application.reviewedBy) : null,
    reviewedAt: application.reviewedAt,
    createdAt: application.createdAt,
    project: application.projectId?.title
      ? {
          title: application.projectId.title,
          slug: application.projectId.slug,
          category: application.projectId.category,
          status: application.projectId.status,
        }
      : undefined,
    role: application.roleId?.title ? { title: application.roleId.title } : undefined,
  }
}

async function applyToRole(roleId, applicantId, payload) {
  const role = await roleRepository.findById(roleId)
  if (!role || role.status !== "open") throw new ApiError(404, "Open role not found")

  const project = await projectRepository.findById(role.projectId)
  if (!project || project.status === "archived") throw new ApiError(404, "Project not found")
  if (String(project.ownerId) === String(applicantId)) {
    throw new ApiError(400, "Project owners cannot apply to their own roles")
  }
  if (role.slotsFilled >= role.slotsTotal) {
    throw new ApiError(400, "This role is already full")
  }

  const application = await applicationRepository.create({
    projectId: project._id,
    roleId: role._id,
    applicantId,
    message: payload.message.trim(),
    availabilityHoursPerWeek: payload.availabilityHoursPerWeek || 0,
  })

  await activityService.record({
    actorId: applicantId,
    projectId: project._id,
    targetUserId: project.ownerId,
    type: "application_submitted",
    metadata: { roleTitle: role.title, projectTitle: project.title },
  })

  await notificationService.notify({
    userId: project.ownerId,
    type: "application_submitted",
    title: "New project application",
    body: `${role.title} received a new application.`,
    entityType: "application",
    entityId: application._id,
  })

  return serializeApplication(application)
}

async function listProjectApplications(projectId, userId) {
  const project = await projectRepository.findById(projectId)
  if (!project) throw new ApiError(404, "Project not found")
  if (String(project.ownerId) !== String(userId)) {
    throw new ApiError(403, "Only the project owner can view applications")
  }

  const applications = await applicationRepository.findByProject(projectId)
  return applications.map(serializeApplication)
}

async function listMyApplications(userId) {
  const applications = await applicationRepository.findByApplicant(userId)
  return applications.map(serializeApplication)
}

async function updateApplication(applicationId, userId, status) {
  const normalizedStatuses = ["accepted", "rejected", "withdrawn"]
  if (!normalizedStatuses.includes(status)) {
    throw new ApiError(400, "Invalid application status")
  }

  const isWithdraw = status === "withdrawn"
  const isReview = ["accepted", "rejected"].includes(status)

  if (isWithdraw) {
    const result = await applicationRepository.withdrawAtomic(applicationId, userId)
    if (!result) throw new ApiError(404, "Application not found or already processed")
    await activityService.record({
      actorId: userId,
      projectId: result.projectId,
      targetUserId: result.applicantId,
      type: "application_withdrawn",
      metadata: { projectTitle: result.projectId?.title || "" },
    })
    return serializeApplication(result)
  }

  if (isReview) {
    const projectIds = await projectRepository.findOwnedIds(userId)
    const result = await applicationRepository.reviewAtomic(applicationId, projectIds, status, userId)
    if (!result) throw new ApiError(404, "Application not found or not reviewable")

    if (status === "accepted") {
      const role = await roleRepository.findById(result.roleId)
      if (!role) throw new ApiError(400, "Role not found")

      const filled = await roleRepository.incrementFilledAtomic(result.roleId.toString(), role.slotsTotal)
      if (!filled) throw new ApiError(400, "Role is already full")

      await membershipRepository.create({
        projectId: result.projectId,
        userId: result.applicantId,
        roleId: result.roleId,
        roleTitle: role.title,
      })
    }

    await activityService.record({
      actorId: userId,
      projectId: result.projectId,
      targetUserId: result.applicantId,
      type: `application_${status}`,
      metadata: { projectTitle: result.projectId?.title || "" },
    })

    await notificationService.notify({
      userId: result.applicantId,
      type: `application_${status}`,
      title: `Application ${status}`,
      body: `Your application was ${status}.`,
      entityType: "application",
      entityId: result._id,
    })

    return serializeApplication(result)
  }

  throw new ApiError(400, "Invalid application status")
}

const applicationService = {
  applyToRole,
  listMyApplications,
  listProjectApplications,
  updateApplication,
}

module.exports = { applicationService }
