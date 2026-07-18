const { userRepository } = require("../repositories/user.repository")
const { authService } = require("./auth.service")
const { normalizeStringList } = require("../utils/normalize")

function normalizeProfilePayload(payload) {
  const data = {}

  if (payload.fullName !== undefined) {
    data.fullName = payload.fullName.trim()
  }

  if (payload.username !== undefined) {
    data.username = payload.username ? payload.username.trim().toLowerCase() : undefined
  }

  if (payload.bio !== undefined) {
    data.bio = payload.bio.trim()
  }

  if (payload.skills !== undefined) {
    data.skills = normalizeStringList(payload.skills)
  }

  if (payload.interests !== undefined) {
    data.interests = normalizeStringList(payload.interests)
  }

  if (payload.location !== undefined) {
    data.location = payload.location.trim()
  }

  if (payload.availabilityHoursPerWeek !== undefined) {
    data.availabilityHoursPerWeek = payload.availabilityHoursPerWeek
  }

  if (payload.experienceLevel !== undefined) {
    data.experienceLevel = payload.experienceLevel
  }

  if (payload.socialLinks !== undefined) {
    const links = {}
    if (payload.socialLinks.github !== undefined) links.github = payload.socialLinks.github.trim()
    if (payload.socialLinks.twitter !== undefined) links.twitter = payload.socialLinks.twitter.trim()
    if (payload.socialLinks.linkedin !== undefined) links.linkedin = payload.socialLinks.linkedin.trim()
    if (payload.socialLinks.website !== undefined) links.website = payload.socialLinks.website.trim()
    data.socialLinks = links
  }

  return data
}

async function updateCurrentUser(userId, payload) {
  const data = normalizeProfilePayload(payload)
  const user = await userRepository.updateById(userId, data)
  return authService.toPublicUser(user)
}

const userService = {
  updateCurrentUser,
}

module.exports = { userService }
