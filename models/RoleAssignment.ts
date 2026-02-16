import mongoose, { Schema, models } from "mongoose";

const RoleAssignmentSchema = new Schema(
  {
    event: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },

    student: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    roleSlot: {
      type: Schema.Types.ObjectId,
      ref: "RoleSlot",
      required: true,
    },

    role: {
      type: String,
      enum: ["participant", "volunteer", "judge", "speaker"],
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// One student can have multiple roles BUT not duplicate same slot
RoleAssignmentSchema.index(
  { event: 1, student: 1, roleSlot: 1 },
  { unique: true }
);

export const RoleAssignment =
  models.RoleAssignment ||
  mongoose.model("RoleAssignment", RoleAssignmentSchema);
