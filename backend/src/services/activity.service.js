const { activityRepository } = require("../repositories/activity.repository")

async function record(data) {
  return activityRepository.create(data)
}

async function listForUser(userId, limit) {
  return activityRepository.findForUser(userId, limit)
}

const activityService = {
  listForUser,
  record,
}

module.exports = { activityService }
