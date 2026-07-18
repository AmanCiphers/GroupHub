const { applicationRepository } = require("../repositories/application.repository")
const { membershipRepository } = require("../repositories/membership.repository")
const { notificationRepository } = require("../repositories/notification.repository")
const { projectRepository } = require("../repositories/project.repository")
const { roleRepository } = require("../repositories/role.repository")
const { activityService } = require("./activity.service")

async function getDashboard(userId) {
  const ownedProjects = await projectRepository.findOwned(userId, 10)
  const ownedProjectIds = ownedProjects.map((project) => project._id)

  const [
    activeProjects,
    openRoles,
    applications,
    incomingCount,
    incomingApplications,
    memberships,
    activity,
    unreadNotifications,
  ] = await Promise.all([
    projectRepository.countOwnedActive(userId),
    roleRepository.countOpenByOwnerProjectIds(ownedProjectIds),
    applicationRepository.countByApplicant(userId),
    ownedProjectIds.length ? applicationRepository.countByProjectIds(ownedProjectIds) : 0,
    ownedProjectIds.length ? applicationRepository.findByProjectIds(ownedProjectIds) : [],
    membershipRepository.findByUser(userId).then((ms) => ms.filter((m) => m.roleTitle !== "Owner")),
    activityService.listForUser(userId, 20),
    notificationRepository.countUnread(userId),
  ])

  return {
    stats: {
      activeProjects,
      openRoles,
      applications,
      incomingApplications: incomingCount,
      memberships: memberships.length,
      unreadNotifications,
    },
    ownedProjects: ownedProjects.map((project) => ({
      id: String(project._id),
      title: project.title,
      slug: project.slug,
      status: project.status,
      progressPercent: project.progressPercent,
      nextMilestone: project.nextMilestone,
      updatedAt: project.updatedAt,
    })),
    memberships: memberships.map((membership) => ({
      id: String(membership._id),
      roleTitle: membership.roleTitle,
      joinedAt: membership.joinedAt,
      projectId: String(membership.projectId?._id || membership.projectId),
      project: membership.projectId?.title
        ? {
            id: String(membership.projectId._id || membership.projectId),
            title: membership.projectId.title,
            slug: membership.projectId.slug,
            category: membership.projectId.category,
            status: membership.projectId.status,
            progressPercent: membership.projectId.progressPercent,
            nextMilestone: membership.projectId.nextMilestone,
          }
        : null,
    })),
    incomingApplications: incomingApplications.map((app) => ({
      id: String(app._id),
      projectId: String(app.projectId?._id || app.projectId),
      roleId: String(app.roleId?._id || app.roleId),
      message: app.message,
      status: app.status,
      createdAt: app.createdAt,
      applicant: app.applicantId
        ? {
            id: String(app.applicantId._id || app.applicantId),
            fullName: app.applicantId.fullName,
            email: app.applicantId.email,
            username: app.applicantId.username,
            skills: app.applicantId.skills,
          }
        : null,
      role: app.roleId?.title ? { title: app.roleId.title } : null,
      project: app.projectId?.title
        ? {
            title: app.projectId.title,
            slug: app.projectId.slug,
            category: app.projectId.category,
          }
        : null,
    })),
    activity: activity.map((event) => ({
      id: String(event._id),
      type: event.type,
      projectId: event.projectId ? String(event.projectId) : null,
      targetUserId: event.targetUserId ? String(event.targetUserId) : null,
      metadata: event.metadata,
      createdAt: event.createdAt,
    })),
  }
}

const dashboardService = { getDashboard }

module.exports = { dashboardService }
