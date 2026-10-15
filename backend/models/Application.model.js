import mongoose from "mongoose";
import { APPLICATION_STATUS } from "../utils/enums.js";

const applicationSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    projectRoleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProjectRole",
      required: true,
    },

    applicantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    message: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },

    status: {
      type: String,
      enum: APPLICATION_STATUS,
      default: "Pending",
    },
  },
  {
    timestamps: true,
  },
);

applicationSchema.index({ projectRoleId: 1, applicantId: 1 }, { unique: true });

const Application = mongoose.model("Application", applicationSchema);

export default Application;