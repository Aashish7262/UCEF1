import mongoose, { Schema, models } from "mongoose";

const CertificateSchema = new Schema(
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

    attendance: {
      type: Schema.Types.ObjectId,
      ref: "Attendance",
      required: true,
    },

    fileUrl: {
      type: String,
      required: true,
    },

    isRevoked: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// One certificate per role per event per student
CertificateSchema.index(
  { event: 1, student: 1, role: 1 },
  { unique: true }
);

export const Certificate =
  models.Certificate ||
  mongoose.model("Certificate", CertificateSchema);


