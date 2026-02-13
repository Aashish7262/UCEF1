import mongoose, { Schema, models } from "mongoose";

const HackathonSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    rules: {
      type: [String],
      default: [],
    },

    banner: {
      type: String,
    },

    teamSizeMin: {
      type: Number,
      required: true,
    },

    teamSizeMax: {
      type: Number,
      required: true,
    },

    registrationStart: {
      type: Date,
      required: true,
    },

    registrationDeadline: {
      type: Date,
      required: true,
    },

    hackathonStart: {
      type: Date,
      required: true,
    },

    hackathonEnd: {
      type: Date,
      required: true,
    },

    submissionDeadline: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: [
        "draft",
        "registration-open",
        "registration-closed",
        "submission-open",
        "evaluation",
        "completed",
      ],
      default: "draft",
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export default models.Hackathon ||
  mongoose.model("Hackathon", HackathonSchema);
