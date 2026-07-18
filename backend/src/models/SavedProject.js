const mongoose = require("mongoose")

const savedProjectSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
)

savedProjectSchema.index({ userId: 1, projectId: 1 }, { unique: true })

const SavedProject = mongoose.model("SavedProject", savedProjectSchema)

module.exports = { SavedProject }
