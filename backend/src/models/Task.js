const mongoose = require("mongoose")

const taskSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 5000,
      default: "",
    },
    assigneeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    assignmentType: {
      type: String,
      enum: ["assigned", "open"],
      default: "assigned",
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["todo", "in_progress", "needs_review", "done", "cancelled"],
      default: "todo",
    },
    reviewNote: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    dueDate: {
      type: Date,
    },
  },
  { timestamps: true }
)

taskSchema.index({ projectId: 1, status: 1 })
taskSchema.index({ assigneeId: 1 })

const Task = mongoose.model("Task", taskSchema)

module.exports = { Task }
