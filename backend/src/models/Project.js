const mongoose = require("mongoose")

const projectSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 120,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 20,
      maxlength: 2000,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    stage: {
      type: String,
      enum: ["idea", "research", "prototype", "mvp", "active", "completed", "paused"],
      default: "idea",
    },
    commitmentHoursPerWeek: {
      type: Number,
      min: 0,
      max: 80,
      default: 0,
    },
    commitmentLabel: {
      type: String,
      trim: true,
      maxlength: 80,
      default: "",
    },
    locationType: {
      type: String,
      enum: ["remote", "hybrid", "onsite"],
      default: "remote",
    },
    location: {
      type: String,
      trim: true,
      maxlength: 120,
      default: "Remote",
    },
    status: {
      type: String,
      enum: ["draft", "recruiting", "active", "completed", "archived"],
      default: "recruiting",
      index: true,
    },
    visibility: {
      type: String,
      enum: ["public", "private", "unlisted"],
      default: "public",
      index: true,
    },
    skills: {
      type: [String],
      default: [],
      index: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    teamSizeTarget: {
      type: Number,
      min: 1,
      max: 100,
      default: 1,
    },
    progressPercent: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    nextMilestone: {
      type: String,
      trim: true,
      maxlength: 200,
      default: "",
    },
    publishedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
)

projectSchema.index({ title: "text", description: "text", skills: "text", tags: "text", category: "text" })
projectSchema.index({ status: 1, visibility: 1, category: 1, createdAt: -1 })

const Project = mongoose.model("Project", projectSchema)

module.exports = { Project }
