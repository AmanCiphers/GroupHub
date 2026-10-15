import mongoose from "mongoose";
import { TASK_STATUS } from "../utils/enums.js";

const taskSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },

    assigneeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: TASK_STATUS,
      default: "Todo",
    },

    dueDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

const Task = mongoose.model("Task", taskSchema);

export default Task;