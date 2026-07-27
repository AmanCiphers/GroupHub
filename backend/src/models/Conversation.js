const mongoose = require("mongoose")

const conversationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["project", "dm"],
      required: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    lastMessage: {
      text: { type: String, maxlength: 500 },
      senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      sentAt: Date,
    },
  },
  { timestamps: true }
)

conversationSchema.index({ "participants": 1, "lastMessage.sentAt": -1 })
conversationSchema.index({ projectId: 1 }, { unique: true, sparse: true })

const Conversation = mongoose.model("Conversation", conversationSchema)

module.exports = { Conversation }
