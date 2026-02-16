import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Event } from "@/models/Event";
import { User } from "@/models/User";
import { RoleSlot } from "@/models/RoleSlot";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;
    const { userId, role, startTime, endTime, maxSeats } =
      await req.json();

    // Basic validation
    if (!userId || !role || !startTime || !endTime) {
      return NextResponse.json(
        { message: "userId, role, startTime and endTime are required" },
        { status: 400 }
      );
    }

    const allowedRoles = ["participant", "volunteer", "judge", "speaker"];
    if (!allowedRoles.includes(role)) {
      return NextResponse.json(
        { message: "Invalid role type" },
        { status: 400 }
      );
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (end <= start) {
      return NextResponse.json(
        { message: "End time must be after start time" },
        { status: 400 }
      );
    }

    await connectDB();

    // Check user (must be admin)
    const user = await User.findById(userId);
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { message: "Only organizer (admin) can create role slots" },
        { status: 403 }
      );
    }

    // Check event
    const event = await Event.findById(eventId);
    if (!event) {
      return NextResponse.json(
        { message: "Event not found" },
        { status: 404 }
      );
    }

    // Ensure only event creator (organizer) can add slots
    if (event.createdBy.toString() !== user._id.toString()) {
      return NextResponse.json(
        { message: "You are not allowed to modify this event" },
        { status: 403 }
      );
    }

    // Prevent slots outside event duration
    if (start < event.eventDate || end > event.endDate) {
      return NextResponse.json(
        { message: "Slot time must be within event duration" },
        { status: 400 }
      );
    }

    // Create slot
    const slot = await RoleSlot.create({
      event: eventId,
      role,
      startTime: start,
      endTime: end,
      maxSeats: maxSeats || 0,
    });

    return NextResponse.json(
      {
        message: "Role slot created successfully",
        slot,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("CREATE SLOT ERROR:", error);
    return NextResponse.json(
      { message: "Failed to create role slot" },
      { status: 500 }
    );
  }
}
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;

    await connectDB();

    const slots = await RoleSlot.find({ event: eventId })
      .sort({ startTime: 1 })
      .lean();

    return NextResponse.json(
      { slots },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET SLOTS ERROR:", error);
    return NextResponse.json(
      { message: "Failed to fetch role slots" },
      { status: 500 }
    );
  }
}
