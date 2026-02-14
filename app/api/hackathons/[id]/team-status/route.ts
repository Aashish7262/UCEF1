import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Team from "@/models/Team";
import Invitation from "@/models/Invitation";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();

  const { id: hackathonId } = await params;
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  console.error(userId);
  if (!userId) {
    return NextResponse.json(
      { message: "User ID required" },
      { status: 400 }
    );
  }

  // Check if user is leader
  const leaderTeam = await Team.findOne({
    hackathon: hackathonId,
    leader: userId,
  });

  if (leaderTeam) {
    return NextResponse.json({
      inTeam: true,
      isLeader: true,
      teamId: leaderTeam._id,
      invited: false,
      inviteId: null,
    });
  }

  // Check if user is member
  const memberTeam = await Team.findOne({
    hackathon: hackathonId,
    members: userId,
  });

  if (memberTeam) {
    return NextResponse.json({
      inTeam: true,
      isLeader: false,
      teamId: memberTeam._id,
      invited: false,
      inviteId: null,
    });
  }

  // Check pending invite
  const invite = await Invitation.findOne({
    hackathon: hackathonId,
    to: userId,
    status: "pending",
  });

  if (invite) {
    return NextResponse.json({
      inTeam: false,
      isLeader: false,
      teamId: null,
      invited: true,
      inviteId: invite._id,
    });
  }

  // Default: not in team, no invite
  return NextResponse.json({
    inTeam: false,
    isLeader: false,
    teamId: null,
    invited: false,
    inviteId: null,
  });
}
