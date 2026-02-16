import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Event } from "@/models/Event";
import { User } from "@/models/User";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { message: "userId is required" },
        { status: 400 }
      );
    }

    await connectDB();

    // 1️⃣ Check admin
    const user = await User.findById(userId);
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { message: "Only organizer can release QR" },
        { status: 403 }
      );
    }

    // 2️⃣ Get event
    const event = await Event.findById(eventId);
    if (!event) {
      return NextResponse.json(
        { message: "Event not found" },
        { status: 404 }
      );
    }

    // 3️⃣ Verify organizer (IMPORTANT: uses organizer field)
    if (event.organizer.toString() !== user._id.toString()) {
      return NextResponse.json(
        { message: "You are not the organizer of this event" },
        { status: 403 }
      );
    }

    // 4️⃣ Event must be live (REALISTIC CHECK)
    if (event.status !== "live") {
      return NextResponse.json(
        { message: "Event must be live to release QR" },
        { status: 400 }
      );
    }

    // ❌ REMOVED 2-MINUTE RESTRICTION (REALISTIC SYSTEM)
    // Admin can release QR anytime during live event

    // 5️⃣ Enable QR
    event.qrEnabled = true;
    await event.save();

    return NextResponse.json(
      {
        message: "QR attendance released successfully",
        qrEnabled: true,
        eventId: event._id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("RELEASE QR ERROR:", error);
    return NextResponse.json(
      { message: "Failed to release QR" },
      { status: 500 }
    );
  }
}

