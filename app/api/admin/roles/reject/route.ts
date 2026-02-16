import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { RoleAssignment } from "@/models/RoleAssignment";
import { User } from "@/models/User";
import { Event } from "@/models/Event";

export async function PATCH(req: Request) {
  try {
    const { assignmentId, adminId } = await req.json();

    if (!assignmentId || !adminId) {
      return NextResponse.json(
        { message: "assignmentId and adminId are required" },
        { status: 400 }
      );
    }

    await connectDB();

    // 🔒 Verify admin
    const admin = await User.findById(adminId);
    if (!admin || admin.role !== "admin") {
      return NextResponse.json(
        { message: "Only admin can reject applications" },
        { status: 403 }
      );
    }

    const assignment = await RoleAssignment.findById(assignmentId);
    if (!assignment) {
      return NextResponse.json(
        { message: "Application not found" },
        { status: 404 }
      );
    }

    // 🔒 Verify event organizer (NEW SCHEMA FIX)
    const event = await Event.findById(assignment.event);
    if (!event || event.organizer.toString() !== adminId) {
      return NextResponse.json(
        { message: "Not authorized for this event" },
        { status: 403 }
      );
    }

    assignment.status = "rejected";
    await assignment.save();

    return NextResponse.json(
      {
        message: "Application rejected successfully",
        assignment,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("REJECT ERROR:", error);
    return NextResponse.json(
      { message: "Failed to reject application" },
      { status: 500 }
    );
  }
}
