import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Evaluation from "@/models/Evaluation";
import Result from "@/models/Result";
import Hackathon from "@/models/Hackathon";
import {User} from "@/models/User";
import mongoose from "mongoose";

export async function POST(
 req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } =  await params;
    const { userId } = await req.json();

    if (
      !mongoose.Types.ObjectId.isValid(id) ||
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

    const hackathon = await Hackathon.findById(id);
    if (!hackathon || hackathon.status !== "evaluation") {
      return NextResponse.json(
        { message: "Cannot publish results now" },
        { status: 400 }
      );
    }

    const existingResults = await Result.find({ hackathon: id });
    if (existingResults.length > 0) {
      return NextResponse.json(
        { message: "Results already published" },
        { status: 400 }
      );
    }

    const evaluations = await Evaluation.find({
      hackathon: id,
    }).sort({ finalScore: -1 });

    if (evaluations.length === 0) {
      return NextResponse.json(
        { message: "No evaluations found" },
        { status: 400 }
      );
    }

    const positions = [
      "winner",
      "runner-up",
      "second-runner-up",
    ];

    const results = [];

    for (let i = 0; i < 3 && i < evaluations.length; i++) {
      results.push({
        hackathon: id,
        team: evaluations[i].team,
        position: positions[i],
        score: evaluations[i].finalScore,
      });
    }

    await Result.insertMany(results);

    hackathon.status = "completed";
    await hackathon.save();

    return NextResponse.json({
      message: "Results published successfully",
    });

  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}


