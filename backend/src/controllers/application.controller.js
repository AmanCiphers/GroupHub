const { applicationService } = require("../services/application.service")
const { apiResponse } = require("../utils/ApiResponse")
const { asyncHandler } = require("../utils/asyncHandler")

const applyToRole = asyncHandler(async (req, res) => {
  const application = await applicationService.applyToRole(
    req.params.roleId,
    req.user.id,
    req.validated.body
  )

  apiResponse(res, 201, { application }, "Application submitted")
})

const listProjectApplications = asyncHandler(async (req, res) => {
  const applications = await applicationService.listProjectApplications(
    req.params.projectId,
    req.user.id
  )

  apiResponse(res, 200, { applications })
})

const listMyApplications = asyncHandler(async (req, res) => {
  const applications = await applicationService.listMyApplications(req.user.id)
  apiResponse(res, 200, { applications })
})

const updateApplication = asyncHandler(async (req, res) => {
  const application = await applicationService.updateApplication(
    req.params.id,
    req.user.id,
    req.validated.body.status
  )

  apiResponse(res, 200, { application }, "Application updated")
})

module.exports = {
  applyToRole,
  listMyApplications,
  listProjectApplications,
  updateApplication,
}
