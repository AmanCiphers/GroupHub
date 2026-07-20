const mongoose = require("mongoose")
const { Application } = require("../models/Application")

async function create(data) {
  return Application.create(data)
}

async function findById(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) return null
  return Application.findById(id)
}

async function findByProject(projectId) {
  return Application.find({ projectId })
    .populate("applicantId", "fullName email username skills")
    .sort({ createdAt: -1 })
}

async function findByApplicant(applicantId) {
  return Application.find({ applicantId })
    .populate("projectId", "title slug category status")
    .populate("roleId", "title")
    .sort({ createdAt: -1 })
}

async function updateById(id, data) {
  return Application.findByIdAndUpdate(id, data, { new: true, runValidators: true })
}

async function withdrawAtomic(applicationId, userId) {
  return Application.findOneAndUpdate(
    { _id: applicationId, applicantId: userId, status: "pending" },
    { status: "withdrawn" },
    { new: true }
  )
}

async function reviewAtomic(applicationId, projectIds, status, userId) {
  return Application.findOneAndUpdate(
    {
      _id: applicationId,
      projectId: { $in: projectIds },
      status: "pending",
    },
    { status, reviewedBy: userId, reviewedAt: new Date() },
    { new: true }
  )
}

async function countByApplicant(applicantId) {
  return Application.countDocuments({ applicantId })
}

async function findByProjectIds(projectIds) {
  return Application.find({ projectId: { $in: projectIds } })
    .populate("applicantId", "fullName email username skills avatarUrl")
    .populate("roleId", "title requiredSkills")
    .populate("projectId", "title slug category")
    .sort({ createdAt: -1 })
}

async function countByProjectIds(projectIds) {
  return Application.countDocuments({ projectId: { $in: projectIds } })
}

const applicationRepository = {
  countByApplicant,
  countByProjectIds,
  create,
  findByApplicant,
  findById,
  findByProject,
  findByProjectIds,
  reviewAtomic,
  updateById,
  withdrawAtomic,
}

module.exports = { applicationRepository }
