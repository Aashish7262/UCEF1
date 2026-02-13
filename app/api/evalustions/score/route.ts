import { NextResponse } from "next/server";
import {connectDB} from "@/lib/db";
import Evaluation from "@/models/Evaluation";
import Submission from "@/models/Submission";
import Hackathon from "@/models/Hackathon";
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
    } = await req.json();

    if (
      !mongoose.Types.ObjectId.isValid(hackathonId) ||
      !mongoose.Types.ObjectId.isValid(submissionId)
    ) {
      return NextResponse.json(
        { message: "Invalid IDs" },
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
    console.error("EVALUATION ERROR:", error);
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}
