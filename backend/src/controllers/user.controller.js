const { authService } = require("../services/auth.service")
const { userService } = require("../services/user.service")
const { apiResponse } = require("../utils/ApiResponse")
const { asyncHandler } = require("../utils/asyncHandler")

const getCurrentUser = asyncHandler(async (req, res) => {
  apiResponse(res, 200, {
    user: authService.toPublicUser(req.user),
  })
})

const updateCurrentUser = asyncHandler(async (req, res) => {
  const user = await userService.updateCurrentUser(
    req.user.id,
    req.validated.body
  )

  apiResponse(res, 200, { user }, "Profile updated")
})

module.exports = {
  getCurrentUser,
  updateCurrentUser,
}
