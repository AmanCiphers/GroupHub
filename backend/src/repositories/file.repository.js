const mongoose = require("mongoose")
const { File } = require("../models/File")

async function findByProject(projectId) {
  return File.find({ projectId }).sort({ createdAt: -1 }).populate("uploadedBy", "fullName").lean()
}

async function findById(id) {
  return File.findById(id)
}

async function create(data) {
  return File.create(data)
}

async function remove(id) {
  return File.findByIdAndDelete(id)
}

async function totalSizeByProject(projectId) {
  const result = await File.aggregate([
    { $match: { projectId: new mongoose.Types.ObjectId(projectId) } },
    { $group: { _id: null, total: { $sum: "$size" } } },
  ])
  return result[0]?.total || 0
}

const fileRepository = { findByProject, findById, create, remove, totalSizeByProject }

module.exports = { fileRepository }
