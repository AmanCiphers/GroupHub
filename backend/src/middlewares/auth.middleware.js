const jwt = require("jsonwebtoken")
const { env } = require("../config/env")
const { userRepository } = require("../repositories/user.repository")
const { ApiError } = require("../utils/ApiError")
const { asyncHandler } = require("../utils/asyncHandler")

const authMiddleware = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || ""
  const [, token] = header.split(" ")

  if (!token) {
    throw new ApiError(401, "Authentication required")
  }

  let payload

  try {
    payload = jwt.verify(token, env.JWT_ACCESS_SECRET)
  } catch (_error) {
    throw new ApiError(401, "Invalid or expired token")
  }

  const user = await userRepository.findById(payload.sub)

  if (!user || user.status !== "active") {
    throw new ApiError(401, "User account is not active")
  }

  req.user = user
  next()
})

const optionalAuthMiddleware = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || ""
  const [, token] = header.split(" ")

  if (!token) {
    next()
    return
  }

  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET)
    const user = await userRepository.findById(payload.sub)

    if (user && user.status === "active") {
      req.user = user
    }
  } catch (_error) {
    req.user = undefined
  }

  next()
})

module.exports = { authMiddleware, optionalAuthMiddleware }
