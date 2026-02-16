import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Event } from "@/models/Event";
import { User } from "@/models/User";

export async function PATCH(
 req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { message: "userId is required" },
        { status: 400 }
      );
    }

    await connectDB();

    // 1️⃣ Check user exists & is admin
    const user = await User.findById(userId);
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { message: "Only admin can make event live" },
        { status: 403 }
      );
    }

    // 2️⃣ Find event
    const event = await Event.findById(id);
    if (!event) {
      return NextResponse.json(
        { message: "Event not found" },
        { status: 404 }
      );
    }

    // 🔥 CRITICAL FIX: use ORGANIZER not createdBy
    if (event.organizer.toString() !== user._id.toString()) {
      return NextResponse.json(
        { message: "You are not the organizer of this event" },
        { status: 403 }
      );
    }

    // 3️⃣ Prevent making expired events live
    const now = new Date();
    if (event.endDate && now > event.endDate) {
      return NextResponse.json(
        {
          message:
            "This event has already ended and cannot be made live again",
        },
        { status: 400 }
      );
    }

    // 4️⃣ (OPTIONAL BUT BEST PRACTICE)
    // Ensure roles are defined before going live
    // You can enforce this later with RoleSlot check

    // 5️⃣ Make event live
    event.status = "live";
    await event.save();

    return NextResponse.json(
      {
        message: "Event is now live",
        event,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("MAKE EVENT LIVE ERROR:", error);
    return NextResponse.json(
      { message: "Failed to make event live" },
      { status: 500 }
    );
  }
}


