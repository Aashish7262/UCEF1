import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Team from "@/models/Team";
import Invitation from "@/models/Invitation";
import mongoose from "mongoose";

export async function GET(
  req: Request,
  context: { params: Promise<{ hackathonId: string }> } // ✅ IMPORTANT FIX
) {
  try {
    await connectDB();

    // 🔥 CRITICAL: Await params (App Router requirement)
    const { hackathonId } = await context.params;

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    /* ===== VALIDATIONS (prevents BSON crash forever) ===== */
    if (!hackathonId || !mongoose.Types.ObjectId.isValid(hackathonId)) {
      return NextResponse.json(
        { message: "Invalid hackathon ID" },
        { status: 400 }
      );
    }

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { message: "Invalid user ID" },
        { status: 400 }
      );
    }

    /* ===== FIND TEAM WHERE USER IS LEADER ===== */
    const team = await Team.findOne({
      hackathon: new mongoose.Types.ObjectId(hackathonId), // ✅ FIX
      leader: new mongoose.Types.ObjectId(userId), // ✅ FIX
    }).populate("members", "name email");

    if (!team) {
      return NextResponse.json(
        { message: "Team not found" },
        { status: 404 }
      );
    }

    /* ===== FETCH ALL INVITATIONS FOR THIS TEAM ===== */
    const invitations = await Invitation.find({
      team: team._id,
    }).populate("to", "name email");

    const pending = invitations.filter((i) => i.status === "pending");
    const accepted = invitations.filter((i) => i.status === "accepted");
    const rejected = invitations.filter((i) => i.status === "rejected");

    return NextResponse.json({
      teamName: team.name,
      leader: team.leader,
      members: team.members,
      pendingInvites: pending,
      acceptedInvites: accepted,
      rejectedInvites: rejected,
    });
  } catch (error: any) {
    console.error("TEAM DETAILS ERROR:", error);
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}


