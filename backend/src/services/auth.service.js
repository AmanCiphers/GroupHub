const bcrypt = require("bcryptjs")
const { env } = require("../config/env")
const { refreshTokenRepository } = require("../repositories/refreshToken.repository")
const { userRepository } = require("../repositories/user.repository")
const { tokenService } = require("./token.service")
const { ApiError } = require("../utils/ApiError")
const { normalizeEmail } = require("../utils/normalize")
const { sha256 } = require("../utils/crypto")

function toPublicUser(user) {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    username: user.username || null,
    bio: user.bio,
    skills: user.skills,
    interests: user.interests,
    location: user.location,
    availabilityHoursPerWeek: user.availabilityHoursPerWeek,
    experienceLevel: user.experienceLevel,
    socialLinks: user.socialLinks || {},
    role: user.role,
    emailVerified: user.emailVerified,
    status: user.status,
    reputationPoints: user.reputationPoints,
    createdAt: user.createdAt,
  }
}

async function register(payload, req) {
  const email = normalizeEmail(payload.email)
  const existingUser = await userRepository.findByEmail(email)

  if (existingUser) {
    throw new ApiError(409, "An account with this email already exists")
  }

  const passwordHash = await bcrypt.hash(
    payload.password,
    env.BCRYPT_SALT_ROUNDS
  )

  const user = await userRepository.create({
    email,
    fullName: payload.fullName.trim(),
    passwordHash,
  })

  const accessToken = tokenService.signAccessToken(user)
  const refresh = await tokenService.createRefreshToken(user, req)

  return {
    accessToken,
    refreshToken: refresh.token,
    refreshExpiresAt: refresh.expiresAt,
    user: toPublicUser(user),
  }
}

async function login(payload, req) {
  const email = normalizeEmail(payload.email)
  const user = await userRepository.findByEmail(email, {
    includePassword: true,
  })

  if (!user) {
    throw new ApiError(401, "Invalid email or password")
  }

  if (user.status !== "active") {
    throw new ApiError(403, "This account is not active")
  }

  const passwordMatches = await bcrypt.compare(
    payload.password,
    user.passwordHash
  )

  if (!passwordMatches) {
    throw new ApiError(401, "Invalid email or password")
  }

  await userRepository.markLogin(user.id)

  const accessToken = tokenService.signAccessToken(user)
  const refresh = await tokenService.createRefreshToken(user, req)

  return {
    accessToken,
    refreshToken: refresh.token,
    refreshExpiresAt: refresh.expiresAt,
    user: toPublicUser(user),
  }
}

async function refresh(refreshToken, req) {
  if (!refreshToken) {
    throw new ApiError(401, "Refresh token required")
  }

  const tokenHash = sha256(refreshToken)
  const tokenRecord = await refreshTokenRepository.findActiveByHash(tokenHash)

  if (!tokenRecord) {
    throw new ApiError(401, "Invalid or expired refresh token")
  }

  const user = await userRepository.findById(tokenRecord.userId)

  if (!user || user.status !== "active") {
    throw new ApiError(401, "User account is not active")
  }

  await refreshTokenRepository.revokeByHash(tokenHash)

  const accessToken = tokenService.signAccessToken(user)
  const nextRefresh = await tokenService.createRefreshToken(user, req)

  return {
    accessToken,
    refreshToken: nextRefresh.token,
    refreshExpiresAt: nextRefresh.expiresAt,
    user: toPublicUser(user),
  }
}

async function logout(refreshToken) {
  if (!refreshToken) {
    return
  }

  await refreshTokenRepository.revokeByHash(sha256(refreshToken))
}

const authService = {
  login,
  logout,
  refresh,
  register,
  toPublicUser,
}

module.exports = { authService }
