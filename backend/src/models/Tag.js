const mongoose = require("mongoose")

const tagSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      maxlength: 60,
    },
    displayName: {
      type: String,
      trim: true,
      maxlength: 60,
    },
    type: {
      type: String,
      required: true,
      enum: ["skill", "role"],
      index: true,
    },
    category: {
      type: String,
      trim: true,
      maxlength: 60,
    },
    subCategory: {
      type: String,
      trim: true,
      maxlength: 60,
    },
    count: {
      type: Number,
      default: 1,
      min: 0,
    },
  },
  { timestamps: true }
)

tagSchema.index({ type: 1, category: 1, subCategory: 1 })
tagSchema.index({ name: 1, type: 1 }, { unique: true })

module.exports = mongoose.model("Tag", tagSchema)
