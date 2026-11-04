import mongoose from "mongoose";
import { COMMITMENT, EXPERIENCE_LEVEL } from "../utils/enums.js";

const linksSchema = new mongoose.Schema(
  {
    github: { type: String, trim: true, maxlength: 200, default: "" },
    website: { type: String, trim: true, maxlength: 200, default: "" },
    linkedin: { type: String, trim: true, maxlength: 200, default: "" },
  },
  { _id: false },
);

const resumeSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, min: 0 },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    headline: {
      type: String,
      trim: true,
      maxlength: 120,
      default: "",
    },

    bio: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },

    location: {
      type: String,
      trim: true,
      maxlength: 80,
      default: "",
    },

    skills: {
      type: [String],
      default: [],
    },

    links: {
      type: linksSchema,
      default: () => ({}),
    },

    availability: {
      type: String,
      enum: COMMITMENT,
    },

    experienceLevel: {
      type: String,
      enum: EXPERIENCE_LEVEL,
    },

    resume: {
      type: resumeSchema,
      default: undefined,
    },
  },
  {
    timestamps: true,
  },
);

const User = mongoose.model("User", userSchema);

export default User;
