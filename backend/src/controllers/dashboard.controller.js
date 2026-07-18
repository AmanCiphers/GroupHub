const { dashboardService } = require("../services/dashboard.service")
const { apiResponse } = require("../utils/ApiResponse")
const { asyncHandler } = require("../utils/asyncHandler")

const getDashboard = asyncHandler(async (req, res) => {
  const dashboard = await dashboardService.getDashboard(req.user.id)
  apiResponse(res, 200, { dashboard })
})

module.exports = { getDashboard }
