const { Project } = require("../models/Project")
const { User } = require("../models/User")
const { ProjectMembership } = require("../models/ProjectMembership")
const { ProjectRole } = require("../models/ProjectRole")

const stageValue = { idea: 1, research: 2, prototype: 3, mvp: 4, active: 5, completed: 6, paused: 2 }
const experienceValue = { beginner: 1, intermediate: 2, advanced: 3, expert: 4 }

function skillsOverlap(userSkills, projectSkills) {
  if (!projectSkills.length) return 0
  const userSet = new Set(userSkills.map((s) => s.toLowerCase()))
  const match = projectSkills.filter((s) => userSet.has(s.toLowerCase())).length
  return match / projectSkills.length
}

function interestCategoryMatch(userInterests, projectCategory) {
  if (!userInterests.length || !projectCategory) return 0
  const lc = projectCategory.toLowerCase()
  return userInterests.some((i) => i.toLowerCase() === lc) ? 1 : 0
}

function availabilityFit(userHours, projectHours) {
  const diff = Math.abs(userHours - projectHours)
  return Math.max(0, 1 - diff / 80)
}

function experienceStageFit(experienceLevel, stage) {
  const map = {
    beginner: { idea: 5, research: 4, prototype: 3, mvp: 2, active: 1, completed: 1, paused: 2 },
    intermediate: { idea: 3, research: 4, prototype: 5, mvp: 4, active: 3, completed: 2, paused: 3 },
    advanced: { idea: 1, research: 2, prototype: 3, mvp: 4, active: 5, completed: 4, paused: 3 },
    expert: { idea: 1, research: 1, prototype: 2, mvp: 3, active: 5, completed: 5, paused: 2 },
  }
  return (map[experienceLevel] && map[experienceLevel][stage]) || 0
}

function computeProjectScore(user, project) {
  const skills = skillsOverlap(user.skills || [], project.skills || []) * 35
  const interest = interestCategoryMatch(user.interests || [], project.category) * 20
  const availability = availabilityFit(user.availabilityHoursPerWeek || 0, project.commitmentHoursPerWeek || 0) * 20
  const expFit = (experienceStageFit(user.experienceLevel || "beginner", project.stage || "idea") / 5) * 10
  const reputation = Math.min((user.reputationPoints || 0) / 100, 1) * 15

  return Math.round(skills + interest + availability + expFit + reputation)
}

function computeUserScore(project, user) {
  const skills = skillsOverlap(user.skills || [], project.skills || []) * 35
  const interest = interestCategoryMatch(user.interests || [], project.category) * 20
  const availability = availabilityFit(user.availabilityHoursPerWeek || 0, project.commitmentHoursPerWeek || 0) * 20
  const expFit = (experienceStageFit(user.experienceLevel || "beginner", project.stage || "idea") / 5) * 10
  const reputation = Math.min((user.reputationPoints || 0) / 100, 1) * 15

  return Math.round(skills + interest + availability + expFit + reputation)
}

async function recommendProjects(userId, limit = 5) {
  const user = await User.findById(userId)
  if (!user) return []

  const projects = await Project.find({
    status: { $in: ["recruiting", "active"] },
    visibility: "public",
    ownerId: { $ne: user._id },
  }).lean()

  const membershipProjectIds = await ProjectMembership.find({
    userId: user._id,
    status: "active",
  }).distinct("projectId")
  const excluded = new Set(membershipProjectIds.map((id) => String(id)))

  const scored = []
  for (const project of projects) {
    if (excluded.has(String(project._id))) continue
    const score = computeProjectScore(user, project)
    if (score <= 0) continue
    const openRoles = await ProjectRole.countDocuments({
      projectId: project._id,
      status: "open",
    })
    scored.push({
      id: String(project._id),
      title: project.title,
      slug: project.slug,
      category: project.category,
      stage: project.stage,
      status: project.status,
      skills: project.skills,
      commitmentHoursPerWeek: project.commitmentHoursPerWeek,
      matchScore: score,
      openRoles,
    })
  }

  return scored.sort((a, b) => b.matchScore - a.matchScore).slice(0, limit)
}

async function recommendMembers(projectId, limit = 10) {
  const project = await Project.findById(projectId).lean()
  if (!project) return []

  const existingUserIds = await ProjectMembership.find({
    projectId,
    status: "active",
  }).distinct("userId")
  const excluded = new Set(existingUserIds.map((id) => String(id)))
  excluded.add(String(project.ownerId))

  const users = await User.find({
    _id: { $nin: Array.from(excluded) },
    status: "active",
  }).lean()

  const scored = []
  for (const user of users) {
    const score = computeUserScore(project, user)
    if (score <= 0) continue
    scored.push({
      id: String(user._id),
      fullName: user.fullName,
      username: user.username,
      skills: user.skills || [],
      experienceLevel: user.experienceLevel,
      availabilityHoursPerWeek: user.availabilityHoursPerWeek,
      reputationPoints: user.reputationPoints,
      matchScore: score,
    })
  }

  return scored.sort((a, b) => b.matchScore - a.matchScore).slice(0, limit)
}

const matchmakingService = { recommendProjects, recommendMembers }

module.exports = { matchmakingService }
