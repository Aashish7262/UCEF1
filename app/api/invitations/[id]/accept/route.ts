import { NextResponse } from "next/server";
import {connectDB} from "@/lib/db";
import Invitation from "@/models/Invitation";
import Team from "@/models/Team";
import Hackathon from "@/models/Hackathon";
import mongoose from "mongoose";

export async function PATCH(
 req: Request,
  context: { params: { id: string } }
) {
  try {
    await connectDB();

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid invitation ID" },
        { status: 400 }
      );
    }

    const invitation = await Invitation.findById(id);

    if (!invitation || invitation.status !== "pending") {
      return NextResponse.json(
        { message: "Invitation not valid" },
        { status: 400 }
      );
    }

    const team = await Team.findById(invitation.team);
    if (!team) {
      return NextResponse.json(
        { message: "Team not found" },
        { status: 404 }
      );
    }

    const hackathon = await Hackathon.findById(invitation.hackathon);
    if (!hackathon || hackathon.status !== "registration-open") {
      return NextResponse.json(
        { message: "Registration closed" },
        { status: 400 }
      );
    }

    // Check if already in another team
    const alreadyInTeam = await Team.findOne({
      hackathon: hackathon._id,
      members: invitation.to,
    });

    if (alreadyInTeam) {
      return NextResponse.json(
        { message: "You are already in a team" },
        { status: 400 }
      );
    }

    // Check team size limit
    if (team.members.length >= hackathon.teamSizeMax) {
      return NextResponse.json(
        { message: "Team is already full" },
        { status: 400 }
      );
    }

    // Add member
    team.members.push(invitation.to);
    await team.save();

    // Update invite
    invitation.status = "accepted";
    await invitation.save();

    return NextResponse.json({
      message: "Invitation accepted",
      team,
    });

  } catch (error: any) {
    console.error("ACCEPT INVITE ERROR:", error);
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}
