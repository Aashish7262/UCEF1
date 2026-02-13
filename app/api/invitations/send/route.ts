import { NextResponse } from "next/server";
import {connectDB} from "@/lib/db";
import Invitation from "@/models/Invitation";
import Team from "@/models/Team";
import Hackathon from "@/models/Hackathon";
import {User} from "@/models/User";
import mongoose from "mongoose";

export async function POST(req: Request) {
  try {
    await connectDB();

    const { teamId, toUserId, fromUserId } = await req.json();

    if (
      !mongoose.Types.ObjectId.isValid(teamId) ||
      !mongoose.Types.ObjectId.isValid(toUserId) ||
      !mongoose.Types.ObjectId.isValid(fromUserId)
    ) {
      return NextResponse.json(
        { message: "Invalid IDs" },
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

    const hackathon = await Hackathon.findById(team.hackathon);
    if (!hackathon || hackathon.status !== "registration-open") {
      return NextResponse.json(
        { message: "Registration closed" },
        { status: 400 }
      );
    }

    if (team.leader.toString() !== fromUserId) {
      return NextResponse.json(
        { message: "Only leader can send invites" },
        { status: 403 }
      );
    }

    if (team.members.length >= hackathon.teamSizeMax) {
      return NextResponse.json(
        { message: "Team is full" },
        { status: 400 }
      );
    }

    const user = await User.findById(toUserId);
    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    const alreadyInTeam = await Team.findOne({
      hackathon: hackathon._id,
      members: toUserId,
    });

    if (alreadyInTeam) {
      return NextResponse.json(
        { message: "User already in a team" },
        { status: 400 }
      );
    }

    const existingInvite = await Invitation.findOne({
      team: teamId,
      to: toUserId,
      status: "pending",
    });

    if (existingInvite) {
      return NextResponse.json(
        { message: "Invite already sent" },
        { status: 400 }
      );
    }

    const invite = await Invitation.create({
      hackathon: hackathon._id,
      team: teamId,
      from: fromUserId,
      to: toUserId,
    });

    return NextResponse.json({ invite }, { status: 201 });

  } catch (error: any) {
    console.error("SEND INVITE ERROR:", error);
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}
