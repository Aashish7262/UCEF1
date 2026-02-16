import mongoose, { Schema, models } from "mongoose";

const RoleSlotSchema = new Schema(
  {
    event: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },

    role: {
      type: String,
      enum: ["participant", "volunteer", "judge", "speaker"],
      required: true,
    },

    startTime: {
      type: Date,
      required: true,
    },

    endTime: {
      type: Date,
      required: true,
    },

    maxSeats: {
      type: Number,
      default: 0, // 0 = unlimited
    },
  },
  { timestamps: true }
);

export const RoleSlot =
  models.RoleSlot || mongoose.model("RoleSlot", RoleSlotSchema);
