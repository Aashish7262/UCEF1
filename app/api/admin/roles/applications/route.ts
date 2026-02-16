import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { RoleAssignment } from "@/models/RoleAssignment";
import { User } from "@/models/User";
import { Event } from "@/models/Event";

export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("eventId");
    const adminId = searchParams.get("adminId");

    if (!eventId || !adminId) {
      return NextResponse.json(
        { message: "eventId and adminId are required" },
        { status: 400 }
      );
    }

    // 🔒 Verify admin
    const admin = await User.findById(adminId);
    if (!admin || admin.role !== "admin") {
      return NextResponse.json(
        { message: "Only admin can view applications" },
        { status: 403 }
      );
    }

    // 🔒 Verify admin owns the event (NEW SCHEMA uses organizer)
    const event = await Event.findById(eventId);
    if (!event) {
      return NextResponse.json(
        { message: "Event not found" },
        { status: 404 }
      );
    }

    if (event.organizer.toString() !== adminId) {
      return NextResponse.json(
        { message: "You are not the organizer of this event" },
        { status: 403 }
      );
    }

    // 📥 Get all applications with student + roleSlot details
    const applications = await RoleAssignment.find({
      event: eventId,
    })
      .populate("student", "name email")
      .populate("roleSlot");

    return NextResponse.json(
      {
        message: "Applications fetched successfully",
        applications,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("ADMIN GET APPLICATIONS ERROR:", error);
    return NextResponse.json(
      { message: "Failed to fetch applications" },
      { status: 500 }
    );
  }
}
