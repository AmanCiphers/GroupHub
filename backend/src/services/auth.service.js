const bcrypt = require("bcryptjs")
const { env } = require("../config/env")
const { refreshTokenRepository } = require("../repositories/refreshToken.repository")
const { userRepository } = require("../repositories/user.repository")
const { tokenService } = require("./token.service")
const { emailService } = require("./email.service")
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

  const existingUsername = await userRepository.findByUsername(payload.username)
  if (existingUsername) {
    throw new ApiError(409, "This username is already taken")
  }

  const passwordHash = await bcrypt.hash(
    payload.password,
    env.BCRYPT_SALT_ROUNDS
  )

  const user = await userRepository.create({
    email,
    fullName: payload.fullName.trim(),
    username: payload.username.trim().toLowerCase(),
    passwordHash,
    status: "pending",
    emailVerified: false,
  })

  const verificationToken = tokenService.signEmailVerificationToken(user.id)
  emailService.sendVerificationEmail({ to: email, token: verificationToken, fullName: payload.fullName.trim() })

  return {
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

  if (user.status === "pending") {
    throw new ApiError(403, "Please verify your email before signing in. Check your inbox for the verification link.")
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

async function verifyEmail(token) {
  let userId
  try {
    userId = tokenService.verifyEmailVerificationToken(token)
  } catch (err) {
    throw new ApiError(400, err.message === "Invalid token type" ? "Invalid verification link" : "Verification link expired or invalid")
  }

  const user = await userRepository.findById(userId)

  if (!user) {
    throw new ApiError(400, "Invalid verification link")
  }

  if (user.emailVerified && user.status === "active") {
    return user
  }

  const updated = await userRepository.updateById(userId, {
    emailVerified: true,
    status: "active",
  })

  return updated
}

async function resendVerificationEmail(email) {
  const normalized = normalizeEmail(email)
  const user = await userRepository.findByEmail(normalized)

  if (!user) {
    return
  }

  if (user.emailVerified) {
    return
  }

  const verificationToken = tokenService.signEmailVerificationToken(user.id)
  emailService.sendVerificationEmail({ to: normalized, token: verificationToken, fullName: user.fullName })
}

async function forgotPassword(payload) {
  const email = normalizeEmail(payload.email)
  const user = await userRepository.findByEmail(email)

  if (!user) {
    return
  }

  const token = tokenService.signPasswordResetToken(user.id)
  emailService.sendPasswordResetEmail({ to: email, token })
}

async function resetPassword(payload) {
  let userId
  try {
    userId = tokenService.verifyPasswordResetToken(payload.token)
  } catch {
    throw new ApiError(400, "Reset link expired or invalid")
  }

  const user = await userRepository.findById(userId)

  if (!user) {
    throw new ApiError(400, "Reset link expired or invalid")
  }

  const passwordHash = await bcrypt.hash(payload.password, env.BCRYPT_SALT_ROUNDS)
  await userRepository.updateById(userId, { passwordHash })
}

const authService = {
  forgotPassword,
  login,
  logout,
  refresh,
  register,
  resendVerificationEmail,
  resetPassword,
  toPublicUser,
  verifyEmail,
}

module.exports = { authService }
