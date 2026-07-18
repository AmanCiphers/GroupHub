const { RefreshToken } = require("../models/RefreshToken")

async function create(data) {
  return RefreshToken.create(data)
}

async function findActiveByHash(tokenHash) {
  return RefreshToken.findOne({
    tokenHash,
    revokedAt: { $exists: false },
    expiresAt: { $gt: new Date() },
  })
}

async function revokeByHash(tokenHash) {
  return RefreshToken.findOneAndUpdate(
    { tokenHash, revokedAt: { $exists: false } },
    { revokedAt: new Date() },
    { new: true }
  )
}

async function revokeAllForUser(userId) {
  return RefreshToken.updateMany(
    { userId, revokedAt: { $exists: false } },
    { revokedAt: new Date() }
  )
}

const refreshTokenRepository = {
  create,
  findActiveByHash,
  revokeAllForUser,
  revokeByHash,
}

module.exports = { refreshTokenRepository }
