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

function sanitizeMetadata(data) {
  if (typeof data !== "object" || data === null) return data
  const sanitized = {}
  for (const [key, value] of Object.entries(data)) {
    if (key === "__proto__" || key === "constructor" || key === "prototype") continue
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizeMetadata(value)
    } else {
      sanitized[key] = value
    }
  }
  return sanitized
}

activityEventSchema.pre("save", function (next) {
  if (this.metadata && typeof this.metadata === "object") {
    this.metadata = sanitizeMetadata(this.metadata)
  }
  next()
})

activityEventSchema.index({ projectId: 1, createdAt: -1 })
activityEventSchema.index({ targetUserId: 1, createdAt: -1 })

const ActivityEvent = mongoose.model("ActivityEvent", activityEventSchema)

module.exports = { ActivityEvent }
