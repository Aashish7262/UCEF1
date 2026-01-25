import mongoose, { Schema } from "mongoose";

const participationSchema = new Schema(
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
    status: {
      type: String,
      enum: ["registered", "attended", "absent"], 
      default: "registered",
    },
  },
  { timestamps: true }
);


participationSchema.index(
  { event: 1, student: 1 },
  { unique: true }
);

export const Participation =
  mongoose.models.Participation ||
  mongoose.model("Participation", participationSchema);


