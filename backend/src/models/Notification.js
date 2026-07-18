const mongoose = require("mongoose")

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160,
    },
    body: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
    entityType: {
      type: String,
      trim: true,
      maxlength: 80,
      default: "",
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    readAt: {
      type: Date,
    },
  },
  { timestamps: true }
)

notificationSchema.index({ userId: 1, readAt: 1, createdAt: -1 })

const Notification = mongoose.model("Notification", notificationSchema)

module.exports = { Notification }
