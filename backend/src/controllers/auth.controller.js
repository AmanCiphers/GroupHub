const { authService } = require("../services/auth.service")
const { tokenService } = require("../services/token.service")
const { apiResponse } = require("../utils/ApiResponse")
const { asyncHandler } = require("../utils/asyncHandler")

const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.validated.body, req)

  if (result.user) {
    tokenService.setRefreshCookie(res, result.refreshToken, result.refreshExpiresAt, req)
    tokenService.setAccessTokenCookie(res, result.accessToken, req)

    apiResponse(
      res,
      201,
      {
        user: result.user,
      },
      "Account created"
    )
    return
  }

  apiResponse(res, 201, null, "Registration successful")
})

const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.validated.body, req)

  tokenService.setRefreshCookie(res, result.refreshToken, result.refreshExpiresAt, req)
  tokenService.setAccessTokenCookie(res, result.accessToken, req)

  apiResponse(
    res,
    200,
    {
      user: result.user,
    },
    "Signed in"
  )
})

const refresh = asyncHandler(async (req, res) => {
  const currentRefreshToken = tokenService.getSignedRefreshToken(req)
  const result = await authService.refresh(currentRefreshToken, req)

  tokenService.setRefreshCookie(res, result.refreshToken, result.refreshExpiresAt, req)
  tokenService.setAccessTokenCookie(res, result.accessToken, req)

  apiResponse(
    res,
    200,
    {
      user: result.user,
    },
    "Token refreshed"
  )
})

const logout = asyncHandler(async (req, res) => {
  const currentRefreshToken = tokenService.getSignedRefreshToken(req)
  await authService.logout(currentRefreshToken)
  tokenService.clearRefreshCookie(res, req)
  tokenService.clearAccessTokenCookie(res, req)
  apiResponse(res, 200, null, "Signed out")
})

const getMe = asyncHandler(async (req, res) => {
  apiResponse(res, 200, { user: authService.toPublicUser(req.user) })
})

const { ApiError } = require("../utils/ApiError")

const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.query
  if (!token) {
    throw new ApiError(400, "Verification token required")
  }

  const user = await authService.verifyEmail(token)
  apiResponse(res, 200, { user }, "Email verified successfully")
})

const forgotPassword = asyncHandler(async (req, res) => {
  await authService.forgotPassword(req.validated.body)
  apiResponse(res, 200, null, "If an account exists, a reset link has been sent")
})

const resetPassword = asyncHandler(async (req, res) => {
  await authService.resetPassword(req.validated.body)
  apiResponse(res, 200, null, "Password reset successfully")
})

module.exports = {
  forgotPassword,
  getMe,
  login,
  logout,
  refresh,
  register,
  resetPassword,
  verifyEmail,
}
