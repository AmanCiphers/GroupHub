import mongoose from "mongoose";
import { MEMBER_ROLE, MEMBERSHIP_STATUS } from "../utils/enums.js";

const membershipSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    roleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProjectRole",
    },

    memberRole: {
      type: String,
      enum: MEMBER_ROLE,
      default: "Member",
    },

    status: {
      type: String,
      enum: MEMBERSHIP_STATUS,
      default: "Active",
    },
  },
  {
    timestamps: true,
  },
);

membershipSchema.index({ projectId: 1, userId: 1 }, { unique: true });

const Membership = mongoose.model("Membership", membershipSchema);

export default Membership;