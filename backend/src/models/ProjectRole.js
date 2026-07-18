const mongoose = require("mongoose")

const projectRoleSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },
    requiredSkills: {
      type: [String],
      default: [],
      index: true,
    },
    preferredSkills: {
      type: [String],
      default: [],
    },
    slotsTotal: {
      type: Number,
      min: 1,
      max: 50,
      default: 1,
    },
    slotsFilled: {
      type: Number,
      min: 0,
      default: 0,
    },
    status: {
      type: String,
      enum: ["open", "filled", "closed"],
      default: "open",
      index: true,
    },
    workloadHoursPerWeek: {
      type: Number,
      min: 0,
      max: 80,
      default: 0,
    },
  },
  { timestamps: true }
)

projectRoleSchema.index({ projectId: 1, status: 1 })

const ProjectRole = mongoose.model("ProjectRole", projectRoleSchema)

module.exports = { ProjectRole }
