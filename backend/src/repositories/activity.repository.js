const { ActivityEvent } = require("../models/ActivityEvent")

async function create(data) {
  return ActivityEvent.create(data)
}

async function findForUser(userId, limit = 20) {
  return ActivityEvent.find({
    $or: [{ actorId: userId }, { targetUserId: userId }],
  })
    .sort({ createdAt: -1 })
    .limit(limit)
}

async function findForProject(projectId, limit = 20) {
  return ActivityEvent.find({ projectId }).sort({ createdAt: -1 }).limit(limit)
}

const activityRepository = {
  create,
  findForProject,
  findForUser,
}

module.exports = { activityRepository }
