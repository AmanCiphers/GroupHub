const { SavedProject } = require("../models/SavedProject")

async function create(data) {
  return SavedProject.findOneAndUpdate(data, data, {
    new: true,
    upsert: true,
    setDefaultsOnInsert: true,
  })
}

async function remove(userId, projectId) {
  return SavedProject.findOneAndDelete({ userId, projectId })
}

async function findByUser(userId) {
  return SavedProject.find({ userId })
    .populate("projectId", "title slug description category stage status skills")
    .sort({ createdAt: -1 })
}

async function findIdsByUser(userId) {
  const saved = await SavedProject.find({ userId }).select("projectId")
  return saved.map((item) => String(item.projectId))
}

const savedProjectRepository = {
  create,
  findByUser,
  findIdsByUser,
  remove,
}

module.exports = { savedProjectRepository }
