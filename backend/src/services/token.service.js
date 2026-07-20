const jwt = require("jsonwebtoken")
const { env } = require("../config/env")
const { refreshTokenRepository } = require("../repositories/refreshToken.repository")
const { createOpaqueToken, sha256 } = require("../utils/crypto")

function isCrossOriginRequest(req) {
  const origin = req?.headers?.origin || ""
  const host = req?.headers?.host || ""

  if (!origin || !host) {
    return false
  }

  try {
    const originHost = new URL(origin).hostname
    const localHost = host.split(":")[0]
    return originHost !== localHost
  } catch {
    return false
  }
}

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

function cookieOptions(req) {
  const co = isCrossOriginRequest(req)
  return {
    secure: co,
    sameSite: co ? "none" : "lax",
  }
}

function setRefreshCookie(res, token, expiresAt, req) {
  const { secure, sameSite } = cookieOptions(req)
  res.cookie("refreshToken", token, {
    httpOnly: true,
    signed: true,
    secure,
    sameSite,
    expires: expiresAt,
    path: "/api/v1/auth",
  })
}

function clearRefreshCookie(res, req) {
  const { secure, sameSite } = cookieOptions(req)
  res.clearCookie("refreshToken", {
    httpOnly: true,
    signed: true,
    secure,
    sameSite,
    path: "/api/v1/auth",
  })
}

function accessExpiryDate() {
  const match = /^(\d+)([dhm])$/.exec(env.JWT_ACCESS_EXPIRES_IN)
  const amount = match ? Number(match[1]) : 15
  const unit = match ? match[2] : "m"
  const multipliers = {
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  }

  return new Date(Date.now() + amount * multipliers[unit])
}

function setAccessTokenCookie(res, token, req) {
  const { secure, sameSite } = cookieOptions(req)
  res.cookie("accessToken", token, {
    httpOnly: true,
    signed: true,
    secure,
    sameSite,
    expires: accessExpiryDate(),
    path: "/api/v1",
  })
}

function clearAccessTokenCookie(res, req) {
  const { secure, sameSite } = cookieOptions(req)
  res.clearCookie("accessToken", {
    httpOnly: true,
    signed: true,
    secure,
    sameSite,
    path: "/api/v1",
  })
}

function getSignedAccessToken(req) {
  return req.signedCookies?.accessToken || ""
}

function signEmailVerificationToken(userId) {
  return jwt.sign(
    { type: "email-verify" },
    env.JWT_ACCESS_SECRET,
    {
      subject: userId,
      expiresIn: "24h",
    }
  )
}

function verifyEmailVerificationToken(token) {
  const payload = jwt.verify(token, env.JWT_ACCESS_SECRET, { algorithms: ["HS256"] })
  if (payload.type !== "email-verify") {
    throw new Error("Invalid token type")
  }
  return payload.sub
}

function getSignedRefreshToken(req) {
  return req.signedCookies?.refreshToken || ""
}

const tokenService = {
  clearAccessTokenCookie,
  clearRefreshCookie,
  createRefreshToken,
  getSignedAccessToken,
  getSignedRefreshToken,
  setAccessTokenCookie,
  setRefreshCookie,
  signAccessToken,
  signEmailVerificationToken,
  verifyEmailVerificationToken,
}

module.exports = { tokenService }
