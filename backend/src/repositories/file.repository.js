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

const fileRepository = { findByProject, findById, create, remove }

module.exports = { fileRepository }
