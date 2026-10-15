import mongoose from "mongoose";
import { ROLE_STATUS } from "../utils/enums.js";

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
    },

    skills: {
      type: [String],
      default: [],
    },

    slots: {
      type: Number,
      default: 1,
      min: 1,
    },

    status: {
      type: String,
      enum: ROLE_STATUS,
      default: "Open",
    },
  },
  {
    timestamps: true,
  },
);

const ProjectRole = mongoose.model("ProjectRole", projectRoleSchema);

export default ProjectRole;