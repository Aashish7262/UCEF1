import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Event } from "@/models/Event";
import { Participation } from "@/models/Participation";
import { User } from "@/models/User";


export async function GET(
 req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
   
    const { id: eventId } = await params;

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { message: "userId is required" },
        { status: 400 }
      );
    }

    await connectDB();


    const admin = await User.findById(userId);
    if (!admin || admin.role !== "admin") {
      return NextResponse.json(
        { message: "Only admin can view participants" },
        { status: 403 }
      );
    }


    const event = await Event.findById(eventId);
    if (!event) {
      return NextResponse.json(
        { message: "Event not found" },
        { status: 404 }
      );
    }

    if (event.createdBy.toString() !== admin._id.toString()) {
      return NextResponse.json(
        { message: "Not allowed to view participants of this event" },
        { status: 403 }
      );
    }

    
    const participations = await Participation.find({ event: eventId })
      .populate("student", "name email")
      .sort({ createdAt: 1 })
      .lean();

    const participants = participations.map((p) => ({
      _id: p._id,
      student: p.student,
      status: p.status,
      participatedAt: p.createdAt,
    }));

    return NextResponse.json(
      {
        event: {
          _id: event._id,
          title: event.title,
        },
        participants,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to fetch participants" },
      { status: 500 }
    );
  }
}


