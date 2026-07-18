const { authService } = require("../services/auth.service")
const { tokenService } = require("../services/token.service")
const { apiResponse } = require("../utils/ApiResponse")
const { asyncHandler } = require("../utils/asyncHandler")

const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.validated.body, req)

  tokenService.setRefreshCookie(
    res,
    result.refreshToken,
    result.refreshExpiresAt
  )

  apiResponse(
    res,
    201,
    {
      accessToken: result.accessToken,
      user: result.user,
    },
    "Account created"
  )
})

const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.validated.body, req)

  tokenService.setRefreshCookie(
    res,
    result.refreshToken,
    result.refreshExpiresAt
  )

  apiResponse(
    res,
    200,
    {
      accessToken: result.accessToken,
      user: result.user,
    },
    "Signed in"
  )
})

const refresh = asyncHandler(async (req, res) => {
  const currentRefreshToken = tokenService.getSignedRefreshToken(req)
  const result = await authService.refresh(currentRefreshToken, req)

  tokenService.setRefreshCookie(
    res,
    result.refreshToken,
    result.refreshExpiresAt
  )

  apiResponse(
    res,
    200,
    {
      accessToken: result.accessToken,
      user: result.user,
    },
    "Token refreshed"
  )
})

const logout = asyncHandler(async (req, res) => {
  const currentRefreshToken = tokenService.getSignedRefreshToken(req)
  await authService.logout(currentRefreshToken)
  tokenService.clearRefreshCookie(res)
  apiResponse(res, 200, null, "Signed out")
})

const getMe = asyncHandler(async (req, res) => {
  apiResponse(res, 200, { user: authService.toPublicUser(req.user) })
})

module.exports = {
  getMe,
  login,
  logout,
  refresh,
  register,
}
