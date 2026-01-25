import mongoose, { Schema } from "mongoose";

const certificateSchema = new Schema(
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
    participation: {
      type: Schema.Types.ObjectId,
      ref: "Participation",
      required: true,
      unique: true, 
    },
    fileUrl: {
      type: String, 
      required: true,
    },
  },
  { timestamps: true }
);

export const Certificate =
  mongoose.models.Certificate ||
  mongoose.model("Certificate", certificateSchema);

