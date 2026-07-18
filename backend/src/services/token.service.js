const jwt = require("jsonwebtoken")
const { env } = require("../config/env")
const { refreshTokenRepository } = require("../repositories/refreshToken.repository")
const { createOpaqueToken, sha256 } = require("../utils/crypto")

function signAccessToken(user) {
  return jwt.sign(
    {
      role: user.role,
      email: user.email,
    },
    env.JWT_ACCESS_SECRET,
    {
      subject: user.id,
      expiresIn: env.JWT_ACCESS_EXPIRES_IN,
    }
  )
}

function refreshExpiryDate() {
  const match = /^(\d+)([dhm])$/.exec(env.JWT_REFRESH_EXPIRES_IN)
  const amount = match ? Number(match[1]) : 7
  const unit = match ? match[2] : "d"
  const multipliers = {
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  }

  return new Date(Date.now() + amount * multipliers[unit])
}

async function createRefreshToken(user, req) {
  const token = createOpaqueToken()
  const tokenHash = sha256(token)
  const expiresAt = refreshExpiryDate()

  await refreshTokenRepository.create({
    userId: user.id,
    tokenHash,
    expiresAt,
    userAgent: req.get("user-agent") || "",
    ipAddress: req.ip || "",
  })

  return { expiresAt, token }
}

function setRefreshCookie(res, token, expiresAt) {
  res.cookie("refreshToken", token, {
    httpOnly: true,
    signed: true,
    secure: env.NODE_ENV === "production",
    sameSite: env.NODE_ENV === "production" ? "strict" : "lax",
    expires: expiresAt,
    path: "/api/v1/auth",
  })
}

function clearRefreshCookie(res) {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    signed: true,
    secure: env.NODE_ENV === "production",
    sameSite: env.NODE_ENV === "production" ? "strict" : "lax",
    path: "/api/v1/auth",
  })
}

function getSignedRefreshToken(req) {
  return req.signedCookies?.refreshToken || ""
}

const tokenService = {
  clearRefreshCookie,
  createRefreshToken,
  getSignedRefreshToken,
  setRefreshCookie,
  signAccessToken,
}

module.exports = { tokenService }
