import { NextResponse } from "next/server";
import {connectDB} from "@/lib/db";
import Team from "@/models/Team";
import Hackathon from "@/models/Hackathon";
import mongoose from "mongoose";

export async function POST(req: Request) {
  try {
    await connectDB();

    const { hackathonId, teamName, userId } = await req.json();

    if (
      !mongoose.Types.ObjectId.isValid(hackathonId) ||
      !mongoose.Types.ObjectId.isValid(userId)
    ) {
      return NextResponse.json(
        { message: "Invalid IDs" },
        { status: 400 }
      );
    }

    const hackathon = await Hackathon.findById(hackathonId);

    if (!hackathon) {
      return NextResponse.json(
        { message: "Hackathon not found" },
        { status: 404 }
      );
    }

    if (hackathon.status !== "registration-open") {
      return NextResponse.json(
        { message: "Registration is not open" },
        { status: 400 }
      );
    }

    // Check if user already in a team
    const existingTeam = await Team.findOne({
      hackathon: hackathonId,
      members: userId,
    });

    if (existingTeam) {
      return NextResponse.json(
        { message: "You are already in a team" },
        { status: 400 }
      );
    }

    // Check unique team name
    const nameExists = await Team.findOne({
      hackathon: hackathonId,
      name: teamName,
    });

    if (nameExists) {
      return NextResponse.json(
        { message: "Team name already taken" },
        { status: 400 }
      );
    }

    const team = await Team.create({
      hackathon: hackathonId,
      name: teamName,
      leader: userId,
      members: [userId],
    });

    return NextResponse.json({ team }, { status: 201 });

  } catch (error: any) {
    console.error("CREATE TEAM ERROR:", error);
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}
