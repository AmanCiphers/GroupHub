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

const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.query
  if (!token) {
    res.status(400).json({ message: "Verification token required" })
    return
  }

  const user = await authService.verifyEmail(token)
  apiResponse(res, 200, { user }, "Email verified successfully")
})

module.exports = {
  getMe,
  login,
  logout,
  refresh,
  register,
  verifyEmail,
}
