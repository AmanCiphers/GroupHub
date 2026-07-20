const mongoose = require("mongoose")

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    username: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
    skills: {
      type: [String],
      default: [],
    },
    interests: {
      type: [String],
      default: [],
    },
    location: {
      type: String,
      trim: true,
      maxlength: 120,
      default: "",
    },
    availabilityHoursPerWeek: {
      type: Number,
      min: 0,
      max: 80,
      default: 0,
    },
    experienceLevel: {
      type: String,
      enum: ["beginner", "intermediate", "advanced", "expert"],
      default: "beginner",
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["active", "pending", "suspended", "deleted"],
      default: "active",
    },
    reputationPoints: {
      type: Number,
      min: 0,
      default: 0,
    },
    socialLinks: {
      type: {
        github: { type: String, trim: true, default: "" },
        twitter: { type: String, trim: true, default: "" },
        linkedin: { type: String, trim: true, default: "" },
        website: { type: String, trim: true, default: "" },
      },
      default: {},
    },
    lastLoginAt: {
      type: Date,
    },
  },
  { timestamps: true }
)

userSchema.index({ fullName: "text", username: "text", skills: "text" })

const User = mongoose.model("User", userSchema)

module.exports = { User }
