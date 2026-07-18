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
  const application = await applicationRepository.findById(applicationId)
  if (!application) throw new ApiError(404, "Application not found")

  const project = await projectRepository.findById(application.projectId)
  if (!project) throw new ApiError(404, "Project not found")

  const isApplicant = String(application.applicantId) === String(userId)
  const isOwner = String(project.ownerId) === String(userId)

  if (status === "withdrawn" && !isApplicant) {
    throw new ApiError(403, "Only the applicant can withdraw this application")
  }

  if (["accepted", "rejected"].includes(status) && !isOwner) {
    throw new ApiError(403, "Only the project owner can review this application")
  }

  if (application.status !== "pending") {
    throw new ApiError(400, "Only pending applications can be updated")
  }

  if (status === "accepted") {
    const role = await roleRepository.findById(application.roleId)
    if (!role || role.status !== "open") throw new ApiError(400, "Role is not open")
    if (role.slotsFilled >= role.slotsTotal) throw new ApiError(400, "Role is already full")

    await roleRepository.incrementFilled(role._id)
    await membershipRepository.create({
      projectId: project._id,
      userId: application.applicantId,
      roleId: role._id,
      roleTitle: role.title,
    })
  }

  const updated = await applicationRepository.updateById(applicationId, {
    status,
    reviewedBy: isOwner ? userId : undefined,
    reviewedAt: isOwner ? new Date() : undefined,
  })

  await activityService.record({
    actorId: userId,
    projectId: project._id,
    targetUserId: application.applicantId,
    type:
      status === "accepted"
        ? "application_accepted"
        : status === "rejected"
          ? "application_rejected"
          : "application_withdrawn",
    metadata: { projectTitle: project.title },
  })

  if (isOwner) {
    await notificationService.notify({
      userId: application.applicantId,
      type: `application_${status}`,
      title: `Application ${status}`,
      body: `Your application for ${project.title} was ${status}.`,
      entityType: "application",
      entityId: application._id,
    })
  }

  return serializeApplication(updated)
}

const applicationService = {
  applyToRole,
  listMyApplications,
  listProjectApplications,
  updateApplication,
}

module.exports = { applicationService }
