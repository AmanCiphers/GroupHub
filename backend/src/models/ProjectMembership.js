const mongoose = require("mongoose")

const permissionValues = ["view", "comment", "manage_roles", "manage_applications", "manage_project"]

const projectMembershipSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    roleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProjectRole",
    },
    roleTitle: {
      type: String,
      trim: true,
      maxlength: 80,
      default: "",
    },
    permissions: {
      type: [String],
      enum: permissionValues,
      default: ["view", "comment"],
    },
    status: {
      type: String,
      enum: ["active", "left", "removed"],
      default: "active",
      index: true,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
)

projectMembershipSchema.index({ projectId: 1, userId: 1 }, { unique: true })

const ProjectMembership = mongoose.model("ProjectMembership", projectMembershipSchema)

module.exports = { ProjectMembership, permissionValues }
