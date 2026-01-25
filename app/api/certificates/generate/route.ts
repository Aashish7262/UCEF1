import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Participation } from "@/models/Participation";
import { Certificate } from "@/models/Certificate";
import { User } from "@/models/User";

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
    if (!student) {
      return NextResponse.json(
        { message: "Student not found" },
        { status: 404 }
      );
    }

    
    const participation = await Participation.findOne({
      event: eventId,
      student: studentId,
    });

    if (!participation) {
      return NextResponse.json(
        { message: "You did not participate in this event" },
        { status: 403 }
      );
    }

    if (participation.status !== "attended") {
      return NextResponse.json(
        { message: "Attendance not approved yet" },
        { status: 403 }
      );
    }

    
    const existing = await Certificate.findOne({
      event: eventId,
      student: studentId,
    });

    if (existing) {
      return NextResponse.json(
        {
          message: "Certificate already generated",
          certificateId: existing._id,
        },
        { status: 200 }
      );
    }

   
    const fileUrl = `/certificates/${studentId}_${eventId}.pdf`;

    const certificate = await Certificate.create({
      event: eventId,
      student: studentId,
      participation: participation._id,
      fileUrl,
    });

    return NextResponse.json(
      {
        message: "Certificate generated",
        certificateId: certificate._id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to generate certificate" },
      { status: 500 }
    );
  }
}



