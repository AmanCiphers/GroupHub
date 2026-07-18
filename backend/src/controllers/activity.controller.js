const { activityService } = require("../services/activity.service")
const { activityRepository } = require("../repositories/activity.repository")
const { membershipService } = require("../services/membership.service")
const { projectRepository } = require("../repositories/project.repository")
const { ApiError } = require("../utils/ApiError")
const { apiResponse } = require("../utils/ApiResponse")
const { asyncHandler } = require("../utils/asyncHandler")

const listActivity = asyncHandler(async (req, res) => {
  const activity = await activityService.listForUser(req.user.id, 20)
  apiResponse(res, 200, { activity })
})

const listProjectActivity = asyncHandler(async (req, res) => {
  const project = await projectRepository.findById(req.params.projectId)
  if (!project) throw new ApiError(404, "Project not found")
  const isOwner = String(project.ownerId) === String(req.user.id)
  if (!isOwner && !(await membershipService.isProjectMember(req.params.projectId, req.user.id))) {
    throw new ApiError(403, "Only project members can view activity")
  }
  const activity = await activityRepository.findForProject(req.params.projectId, 30)
  apiResponse(res, 200, { activity })
})

module.exports = { listActivity, listProjectActivity }
