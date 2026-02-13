import { NextResponse } from "next/server";
import {connectDB} from "@/lib/db";
import Evaluation from "@/models/Evaluation";
import Team from "@/models/Team";
import mongoose from "mongoose";

export async function GET(
 req: Request,
  context: { params: { id: string } }
) {
  try {
    await connectDB();

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid hackathon ID" },
        { status: 400 }
      );
    }

    const evaluations = await Evaluation.find({
      hackathon: id,
    })
      .populate("team", "name")
      .sort({ finalScore: -1 });

    const leaderboard = evaluations.map((evalDoc, index) => ({
      rank: index + 1,
      teamName: evalDoc.team?.name,
      score: evalDoc.finalScore,
      technical: evalDoc.technical,
      innovation: evalDoc.innovation,
      presentation: evalDoc.presentation,
    }));

    return NextResponse.json({ leaderboard });

  } catch (error: any) {
    console.error("LEADERBOARD ERROR:", error);
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}
