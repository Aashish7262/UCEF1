import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Evaluation from "@/models/Evaluation";
import Submission from "@/models/Submission";
import Hackathon from "@/models/Hackathon";
import {User} from "@/models/User";
import mongoose from "mongoose";

export async function POST(req: Request) {
  try {
    await connectDB();

    const {
      hackathonId,
      submissionId,
      technical,
      innovation,
      presentation,
      feedback,
      userId,
    } = await req.json();

    if (
      !mongoose.Types.ObjectId.isValid(hackathonId) ||
      !mongoose.Types.ObjectId.isValid(submissionId) ||
      !mongoose.Types.ObjectId.isValid(userId)
    ) {
      return NextResponse.json(
        { message: "Invalid IDs" },
        { status: 400 }
      );
    }

    const user = await User.findById(userId);
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { message: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }

    if (
      technical < 0 || technical > 10 ||
      innovation < 0 || innovation > 10 ||
      presentation < 0 || presentation > 10
    ) {
      return NextResponse.json(
        { message: "Scores must be between 0 and 10" },
        { status: 400 }
      );
    }

    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon || hackathon.status !== "evaluation") {
      return NextResponse.json(
        { message: "Evaluation phase not active" },
        { status: 400 }
      );
    }

    const submission = await Submission.findById(submissionId);
    if (!submission) {
      return NextResponse.json(
        { message: "Submission not found" },
        { status: 404 }
      );
    }

    const existingEvaluation = await Evaluation.findOne({
      hackathon: hackathonId,
      submission: submissionId,
    });

    if (existingEvaluation) {
      return NextResponse.json(
        { message: "This team already evaluated" },
        { status: 400 }
      );
    }

    const finalScore =
      (technical + innovation + presentation) / 3;

    const evaluation = await Evaluation.create({
      hackathon: hackathonId,
      team: submission.team,
      submission: submissionId,
      technical,
      innovation,
      presentation,
      feedback,
      finalScore,
    });

    return NextResponse.json({ evaluation }, { status: 201 });

  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}

