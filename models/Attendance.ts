import mongoose, { Schema, models } from "mongoose";

const AttendanceSchema = new Schema(
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

    role: {
      type: String,
      enum: ["participant", "volunteer", "judge", "speaker"],
      required: true,
    },

    scannedAt: {
      type: Date,
      default: Date.now,
    },

    markedBy: {
      type: Schema.Types.ObjectId,
      ref: "User", // organizer/admin
    },

    status: {
      type: String,
      enum: ["present", "absent"],
      default: "present",
    },
  },
  { timestamps: true }
);

export const Attendance =
  models.Attendance || mongoose.model("Attendance", AttendanceSchema);
