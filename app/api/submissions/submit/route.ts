import { NextResponse } from "next/server";
import {connectDB} from "@/lib/db";
import Submission from "@/models/Submission";
import Team from "@/models/Team";
import Hackathon from "@/models/Hackathon";
import mongoose from "mongoose";

export async function POST(req: Request) {
  try {
    await connectDB();

    const {
      hackathonId,
      teamId,
      userId,
      githubLink,
      demoLink,
      presentationLink,
      description,
    } = await req.json();

    if (
      !mongoose.Types.ObjectId.isValid(hackathonId) ||
      !mongoose.Types.ObjectId.isValid(teamId) ||
      !mongoose.Types.ObjectId.isValid(userId)
    ) {
      return NextResponse.json(
        { message: "Invalid IDs" },
        { status: 400 }
      );
    }

    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon || hackathon.status !== "submission-open") {
      return NextResponse.json(
        { message: "Submission phase not active" },
        { status: 400 }
      );
    }

    if (new Date() > new Date(hackathon.submissionDeadline)) {
      return NextResponse.json(
        { message: "Submission deadline passed" },
        { status: 400 }
      );
    }

    const team = await Team.findById(teamId);
    if (!team) {
      return NextResponse.json(
        { message: "Team not found" },
        { status: 404 }
      );
    }

    if (team.leader.toString() !== userId) {
      return NextResponse.json(
        { message: "Only leader can submit" },
        { status: 403 }
      );
    }

    if (team.members.length < hackathon.teamSizeMin) {
      return NextResponse.json(
        { message: "Minimum team size not met" },
        { status: 400 }
      );
    }

    // Allow resubmission (overwrite)
    const existing = await Submission.findOne({
      hackathon: hackathonId,
      team: teamId,
    });

    if (existing) {
      existing.githubLink = githubLink;
      existing.demoLink = demoLink;
      existing.presentationLink = presentationLink;
      existing.description = description;
      await existing.save();

      return NextResponse.json({
        message: "Submission updated",
        submission: existing,
      });
    }

    const submission = await Submission.create({
      hackathon: hackathonId,
      team: teamId,
      githubLink,
      demoLink,
      presentationLink,
      description,
    });

    return NextResponse.json(
      { submission },
      { status: 201 }
    );

  } catch (error: any) {
    console.error("SUBMISSION ERROR:", error);
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}
