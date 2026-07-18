const mongoose = require("mongoose")

const activityEventSchema = new mongoose.Schema(
  {
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      index: true,
    },
    targetUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        "project_created",
        "role_created",
        "application_submitted",
        "application_accepted",
        "application_rejected",
        "application_withdrawn",
        "project_updated",
        "member_joined",
        "progress_updated",
      ],
      index: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
)

activityEventSchema.index({ projectId: 1, createdAt: -1 })
activityEventSchema.index({ targetUserId: 1, createdAt: -1 })

const ActivityEvent = mongoose.model("ActivityEvent", activityEventSchema)

module.exports = { ActivityEvent }
