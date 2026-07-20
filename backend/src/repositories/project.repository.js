const mongoose = require("mongoose")
const { Project } = require("../models/Project")

function buildProjectFilter(query = {}) {
  const filter = {
    visibility: "public",
    status: { $ne: "archived" },
  }

  if (query.category) filter.category = query.category
  if (query.stage) filter.stage = query.stage
  if (query.status) filter.status = query.status
  if (query.skill) filter.skills = query.skill

  if (query.q) {
    const sanitized = query.q.replace(/[^\w\s]/g, " ").trim().slice(0, 100)
    if (sanitized) {
      filter.$text = { $search: sanitized }
    }
  }

  return filter
}

async function create(data) {
  return Project.create(data)
}

async function findById(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) return null
  return Project.findById(id)
}

async function findByIdOrSlug(idOrSlug) {
  if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
    const byId = await Project.findById(idOrSlug)
    if (byId) return byId
  }

  return Project.findOne({ slug: idOrSlug })
}

async function list(query, pagination) {
  const filter = buildProjectFilter(query)
  const sort = query.q ? { score: { $meta: "textScore" } } : { createdAt: -1 }

  const [items, total] = await Promise.all([
    Project.find(filter).sort(sort).skip(pagination.skip).limit(pagination.limit),
    Project.countDocuments(filter),
  ])

  return { items, total }
}

async function updateById(id, data) {
  return Project.findByIdAndUpdate(id, data, { new: true, runValidators: true })
}

async function countOwnedActive(ownerId) {
  return Project.countDocuments({ ownerId, status: { $in: ["recruiting", "active"] } })
}

async function findOwned(ownerId, limit = 10) {
  return Project.find({ ownerId, status: { $ne: "archived" } })
    .sort({ updatedAt: -1 })
    .limit(limit)
}

async function findOwnedIds(ownerId) {
  const projects = await Project.find({ ownerId }).select("_id").lean()
  return projects.map((p) => String(p._id))
}

const projectRepository = {
  countOwnedActive,
  create,
  findById,
  findByIdOrSlug,
  findOwned,
  findOwnedIds,
  list,
  updateById,
}

module.exports = { projectRepository }
