const { User } = require("../models/User")

async function create(data) {
  return User.create(data)
}

async function findByEmail(email, options = {}) {
  const query = User.findOne({ email })

  if (options.includePassword) {
    query.select("+passwordHash")
  }

  return query
}

async function findById(id) {
  return User.findById(id)
}

async function markLogin(userId) {
  return User.findByIdAndUpdate(
    userId,
    { lastLoginAt: new Date() },
    { new: true }
  )
}

function sanitizeData(data) {
  if (typeof data !== "object" || data === null) return data
  const sanitized = {}
  for (const [key, value] of Object.entries(data)) {
    if (key.startsWith("$") || key === "__proto__" || key === "constructor" || key === "prototype") continue
    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      sanitized[key] = sanitizeData(value)
    } else {
      sanitized[key] = value
    }
  }
  return sanitized
}

async function updateById(userId, data) {
  const cleaned = sanitizeData(data)
  return User.findByIdAndUpdate(userId, cleaned, {
    new: true,
    runValidators: true,
  })
}

const userRepository = {
  create,
  findByEmail,
  findById,
  markLogin,
  updateById,
}

module.exports = { userRepository }
