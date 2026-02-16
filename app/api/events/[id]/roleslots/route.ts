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

    // 🔹 Basic validation
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

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json(
        { message: "Invalid date format" },
        { status: 400 }
      );
    }

    if (end <= start) {
      return NextResponse.json(
        { message: "End time must be after start time" },
        { status: 400 }
      );
    }

    await connectDB();

    // 🔥 Step 1: Verify organizer (ADMIN)
    const user = await User.findById(userId);
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { message: "Only organizer (admin) can define role slots" },
        { status: 403 }
      );
    }

    // 🔥 Step 2: Get event (using NEW schema: organizer)
    const event = await Event.findById(eventId);
    if (!event) {
      return NextResponse.json(
        { message: "Event not found" },
        { status: 404 }
      );
    }

    // 🔥 IMPORTANT: Match NEW model (organizer, NOT createdBy)
    if (event.organizer.toString() !== user._id.toString()) {
      return NextResponse.json(
        { message: "You are not allowed to modify this event" },
        { status: 403 }
      );
    }

    // 🔴 CRITICAL RULE: Slots only allowed in DRAFT stage
    if (event.status !== "draft") {
      return NextResponse.json(
        { message: "Cannot add role slots after event is live" },
        { status: 400 }
      );
    }

    // 🔹 Ensure slot is within event duration
    if (start < event.eventDate || end > event.endDate) {
      return NextResponse.json(
        {
          message:
            "Role slot time must be within event start and end time",
        },
        { status: 400 }
      );
    }

    // 🔹 Create role slot (aligned with your RoleSlot model)
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
    console.error("CREATE ROLE SLOT ERROR:", error);
    return NextResponse.json(
      { message: "Failed to create role slot" },
      { status: 500 }
    );
  }
}

// 🔹 GET: Fetch all slots for an event (student + organizer use)
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
    console.error("GET ROLE SLOTS ERROR:", error);
    return NextResponse.json(
      { message: "Failed to fetch role slots" },
      { status: 500 }
    );
  }
}
