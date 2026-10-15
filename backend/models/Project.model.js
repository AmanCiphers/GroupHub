import mongoose from "mongoose";
import {
  PROJECT_STAGES,
  PROJECT_STATUS,
  PROJECT_VISIBILITY,
  PROJECT_JOIN_POLICY,
  PROJECT_CATEGORIES,
  COMMITMENT,
  TASK_STATUS,
  COMPENSATION,
  EXPERIENCE_LEVEL,
} from "../utils/enums.js";

const milestoneSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    dueDate: {
      type: Date,
    },

    status: {
      type: String,
      enum: TASK_STATUS,
      default: "Todo",
    },
  },
  { _id: false },
);

const projectSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },

    whyBuilding: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },

    targetAudience: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },

    compensation: {
      type: String,
      enum: COMPENSATION,
      required: true,
      default: "volunteer",
    },

    experienceLevel: {
      type: String,
      enum: EXPERIENCE_LEVEL,
      required: true,
      default: "any",
    },

    currentStatus: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },

    targetEndDate: {
      type: Date,
    },

    contactInfo: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },

    category: {
      type: String,
      enum: PROJECT_CATEGORIES,
      required: true,
    },

    tags: {
      type: [String],
      default: [],
    },

    skills: {
      type: [String],
      default: [],
    },

    stage: {
      type: String,
      enum: PROJECT_STAGES,
      default: "Idea",
    },

    status: {
      type: String,
      enum: PROJECT_STATUS,
      default: "Recruiting",
    },

    visibility: {
      type: String,
      enum: PROJECT_VISIBILITY,
      default: "public",
    },

    joinPolicy: {
      type: String,
      enum: PROJECT_JOIN_POLICY,
      default: "approval",
    },

    commitment: {
      type: String,
      enum: COMMITMENT,
      default: "3 hrs/week",
    },

    location: {
      type: String,
      trim: true,
      default: "Remote",
    },

    startDate: {
      type: Date,
    },

    milestones: {
      type: [milestoneSchema],
      default: [],
    },

    maxTeamSize: {
      type: Number,
      default: 5,
      min: 1,
    },

    spotsOpen: {
      type: Number,
      default: 0,
      min: 0,
    },

    teamSize: {
      type: Number,
      default: 1,
      min: 1,
    },

    memberCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    applicantCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

projectSchema.index({ ownerId: 1, title: 1 }, { unique: true });

const Project = mongoose.model("Project", projectSchema);

export default Project;