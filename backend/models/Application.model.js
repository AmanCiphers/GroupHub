import mongoose from "mongoose";
import { APPLICATION_STATUS, COMMITMENT } from "../utils/enums.js";

const resumeSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, min: 0 },
    source: {
      type: String,
      enum: ["profile", "upload"],
      required: true,
    },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

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

    experience: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },

    portfolioUrl: {
      type: String,
      trim: true,
      maxlength: 300,
      default: "",
    },

    availability: {
      type: String,
      enum: COMMITMENT,
      default: undefined,
    },

    timezone: {
      type: String,
      trim: true,
      maxlength: 80,
      default: "",
    },

    startDate: {
      type: Date,
      default: undefined,
    },

    resume: {
      type: resumeSchema,
      default: undefined,
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