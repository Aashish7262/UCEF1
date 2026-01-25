import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Participation } from "@/models/Participation";
import { Event } from "@/models/Event";
import { User } from "@/models/User";

/* =========================================================
   POST → Register for an event (ONCE ONLY)
   ========================================================= */
export async function POST(req: Request) {
  try {
    const { eventId, studentId } = await req.json();

    if (!eventId || !studentId) {
      return NextResponse.json(
        { message: "eventId and studentId are required" },
        { status: 400 }
      );
    }

    await connectDB();

   
    const student = await User.findById(studentId);
    if (!student || student.role !== "student") {
      return NextResponse.json(
        { message: "Only students can participate" },
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

    if (event.status !== "live") {
      return NextResponse.json(
        { message: "Event is not live" },
        { status: 400 }
      );
    }

   
    const now = new Date();
    if (event.endDate && event.endDate < now) {
      return NextResponse.json(
        { message: "Event registration has closed" },
        { status: 400 }
      );
    }

   
    const existing = await Participation.findOne({
      event: eventId,
      student: studentId,
    });

    if (existing) {
      return NextResponse.json(
        { message: "Already registered for this event" },
        { status: 409 }
      );
    }

   
    const participation = await Participation.create({
      event: eventId,
      student: studentId,
      status: "registered",
    });

    return NextResponse.json(
      { message: "Successfully registered", participation },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to participate in event" },
      { status: 500 }
    );
  }
}


export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");

    if (!studentId) {
      return NextResponse.json(
        { message: "studentId is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const participations = await Participation.find({
      student: studentId,
    })
      .select("event status certificate")
      .lean();

    return NextResponse.json(
      { participations },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to fetch participations" },
      { status: 500 }
    );
  }
}


