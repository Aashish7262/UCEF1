import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Invitation from "@/models/Invitation";
import Team from "@/models/Team";
import Hackathon from "@/models/Hackathon";
import mongoose from "mongoose";

export async function POST(req: Request) {
  try {
    await connectDB();

    const { hackathonId, teamId, fromUserId, toUserId } = await req.json();

    if (
      !mongoose.Types.ObjectId.isValid(hackathonId) ||
      !mongoose.Types.ObjectId.isValid(teamId) ||
      !mongoose.Types.ObjectId.isValid(fromUserId) ||
      !mongoose.Types.ObjectId.isValid(toUserId)
    ) {
      return NextResponse.json(
        { message: "Invalid IDs" },
        { status: 400 }
      );
    }

    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon || hackathon.status !== "registration-open") {
      return NextResponse.json(
        { message: "Registration not open" },
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

    if (team.leader.toString() !== fromUserId) {
      return NextResponse.json(
        { message: "Only leader can invite" },
        { status: 403 }
      );
    }

    if (team.members.length >= hackathon.teamSizeMax) {
      return NextResponse.json(
        { message: "Team is full" },
        { status: 400 }
      );
    }

    const alreadyInTeam = await Team.findOne({
      hackathon: hackathonId,
      members: toUserId,
    });

    if (alreadyInTeam) {
      return NextResponse.json(
        { message: "User already in a team" },
        { status: 400 }
      );
    }

    const existingInvite = await Invitation.findOne({
      hackathon: hackathonId,
      team: teamId,
      to: toUserId,
      status: "pending",
    });

    if (existingInvite) {
      return NextResponse.json(
        { message: "Invitation already sent" },
        { status: 400 }
      );
    }

    const invitation = await Invitation.create({
      hackathon: hackathonId,
      team: teamId,
      from: fromUserId,   // ✅ matches your schema
      to: toUserId,       // ✅ matches your schema
      status: "pending",
    });

    return NextResponse.json({ invitation }, { status: 201 });

  } catch (error: any) {
    console.error("CREATE INVITE ERROR:", error);
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}

