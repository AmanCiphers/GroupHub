const { savedProjectService } = require("../services/savedProject.service")
const { apiResponse } = require("../utils/ApiResponse")
const { asyncHandler } = require("../utils/asyncHandler")

const listSavedProjects = asyncHandler(async (req, res) => {
  const projects = await savedProjectService.listSavedProjects(req.user.id)
  apiResponse(res, 200, { projects })
})

module.exports = { listSavedProjects }
