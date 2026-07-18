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

async function updateById(userId, data) {
  return User.findByIdAndUpdate(userId, data, {
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
