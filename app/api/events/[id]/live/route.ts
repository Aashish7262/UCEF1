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

   
    const user = await User.findById(userId);
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { message: "Only admin can make event live" },
        { status: 403 }
      );
    }

   
    const event = await Event.findById(id);
    if (!event) {
      return NextResponse.json(
        { message: "Event not found" },
        { status: 404 }
      );
    }

   
    if (event.createdBy.toString() !== user._id.toString()) {
      return NextResponse.json(
        { message: "You are not allowed to modify this event" },
        { status: 403 }
      );
    }

   
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

   
    event.status = "live";
    await event.save();

    return NextResponse.json(
      { message: "Event is now live", event },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to make event live" },
      { status: 500 }
    );
  }
}


