const { membershipService } = require("../services/membership.service")
const { apiResponse } = require("../utils/ApiResponse")
const { asyncHandler } = require("../utils/asyncHandler")

const leaveProject = asyncHandler(async (req, res) => {
  await membershipService.leaveProject(req.params.projectId, req.user.id)
  apiResponse(res, 200, null, "Left project")
})

const removeMember = asyncHandler(async (req, res) => {
  await membershipService.removeMember(req.params.projectId, req.user.id, req.params.userId)
  apiResponse(res, 200, null, "Member removed")
})

module.exports = { leaveProject, removeMember }
