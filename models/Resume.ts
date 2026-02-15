import mongoose from "mongoose";

const ResumeSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true },

    name: String,
    role: String,
    summary: String,
    skills: [String],
    projects: String,
    achievements: String,
    codingUrl: String,
    projectUrl: String,
  },
  { timestamps: true }
);

export const Resume =
  mongoose.models.Resume || mongoose.model("Resume", ResumeSchema);