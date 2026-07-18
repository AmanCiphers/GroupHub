const crypto = require("crypto")

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex")
}

function createOpaqueToken() {
  return crypto.randomBytes(48).toString("base64url")
}

module.exports = { createOpaqueToken, sha256 }
