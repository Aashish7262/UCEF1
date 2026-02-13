import mongoose, { Schema, models } from "mongoose";

const EvaluationSchema = new Schema(
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

    submission: {
      type: Schema.Types.ObjectId,
      ref: "Submission",
      required: true,
    },

    technical: {
      type: Number,
      required: true,
    },

    innovation: {
      type: Number,
      required: true,
    },

    presentation: {
      type: Number,
      required: true,
    },

    feedback: {
      type: String,
    },

    finalScore: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

export default models.Evaluation ||
  mongoose.model("Evaluation", EvaluationSchema);
