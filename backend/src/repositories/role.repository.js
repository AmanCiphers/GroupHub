const mongoose = require("mongoose")
const { ProjectRole } = require("../models/ProjectRole")

async function createMany(roles) {
  return ProjectRole.insertMany(roles)
}

async function create(data) {
  return ProjectRole.create(data)
}

async function findById(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) return null
  return ProjectRole.findById(id)
}

async function findByProject(projectId) {
  return ProjectRole.find({ projectId }).sort({ createdAt: 1 })
}

async function countOpenByOwnerProjectIds(projectIds) {
  return ProjectRole.countDocuments({
    projectId: { $in: projectIds },
    status: "open",
  })
}

async function incrementFilled(roleId) {
  return ProjectRole.findByIdAndUpdate(
    roleId,
    { $inc: { slotsFilled: 1 } },
    { new: true, runValidators: true }
  )
}

async function incrementFilledAtomic(roleId, slotsTotal) {
  return ProjectRole.findOneAndUpdate(
    { _id: roleId, slotsFilled: { $lt: slotsTotal } },
    { $inc: { slotsFilled: 1 } },
    { new: true }
  )
}

async function updateById(id, data) {
  return ProjectRole.findByIdAndUpdate(id, data, { new: true, runValidators: true })
}

const roleRepository = {
  countOpenByOwnerProjectIds,
  create,
  createMany,
  findById,
  findByProject,
  incrementFilled,
  incrementFilledAtomic,
  updateById,
}

module.exports = { roleRepository }
