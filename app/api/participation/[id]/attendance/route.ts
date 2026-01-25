import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Participation } from "@/models/Participation";
import { Event } from "@/models/Event";
import { User } from "@/models/User";

export async function PATCH(
  req: Request,
  context: { params: { id: string } }
) {
  try {
    const { id: participationId } = await context.params;
    const { userId, status } = await req.json();

    if (!userId || !status) {
      return NextResponse.json(
        { message: "userId and status are required" },
        { status: 400 }
      );
    }

    
    if (!["registered", "attended", "absent"].includes(status)) {
      return NextResponse.json(
        { message: "Invalid status" },
        { status: 400 }
      );
    }

    await connectDB();

   
    const admin = await User.findById(userId);
    if (!admin || admin.role !== "admin") {
      return NextResponse.json(
        { message: "Only admin can mark attendance" },
        { status: 403 }
      );
    }

    
    const participation = await Participation.findById(participationId);
    if (!participation) {
      return NextResponse.json(
        { message: "Participation not found" },
        { status: 404 }
      );
    }

   
    const event = await Event.findById(participation.event);
    if (!event) {
      return NextResponse.json(
        { message: "Event not found" },
        { status: 404 }
      );
    }

    if (event.createdBy.toString() !== admin._id.toString()) {
      return NextResponse.json(
        { message: "Not allowed to mark attendance" },
        { status: 403 }
      );
    }

    participation.status = status;
    await participation.save();

    return NextResponse.json(
      { message: "Attendance updated", participation },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to mark attendance" },
      { status: 500 }
    );
  }
}




