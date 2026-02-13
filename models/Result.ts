import mongoose, { Schema, models } from "mongoose";

const ResultSchema = new Schema(
  {
    hackathon: {
      type: Schema.Types.ObjectId,
      ref: "Hackathon",
      required: true,
    },

    team: {
      type: Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },

    position: {
      type: String,
      enum: ["winner", "runner-up", "second-runner-up"],
      required: true,
    },

    score: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

export default models.Result ||
  mongoose.model("Result", ResultSchema);
