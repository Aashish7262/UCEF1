import mongoose, { Schema, models } from "mongoose";

const SubmissionSchema = new Schema(
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

    githubLink: {
      type: String,
      required: true,
    },

    demoLink: {
      type: String,
    },

    presentationLink: {
      type: String,
    },

    description: {
      type: String,
    },
  },
  { timestamps: true }
);

export default models.Submission ||
  mongoose.model("Submission", SubmissionSchema);
