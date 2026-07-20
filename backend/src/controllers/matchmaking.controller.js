const { matchmakingService } = require("../services/matchmaking.service")
const { apiResponse } = require("../utils/ApiResponse")
const { asyncHandler } = require("../utils/asyncHandler")

const recommendProjects = asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 5, 20)
  const projects = await matchmakingService.recommendProjects(req.user.id, limit)
  apiResponse(res, 200, { projects })
})

const recommendMembers = asyncHandler(async (req, res) => {
  const { projectId } = req.params
  const limit = Math.min(parseInt(req.query.limit) || 10, 30)
  const members = await matchmakingService.recommendMembers(projectId, limit)
  apiResponse(res, 200, { members })
})

module.exports = { recommendProjects, recommendMembers }
