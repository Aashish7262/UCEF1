import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { RoleAssignment } from "@/models/RoleAssignment";

export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("eventId");
    const studentId = searchParams.get("studentId");

    if (!eventId || !studentId) {
      return NextResponse.json(
        { message: "eventId and studentId are required" },
        { status: 400 }
      );
    }

    // 🔥 Fetch all applications of this student for this event
    const assignments = await RoleAssignment.find({
      event: eventId,
      student: studentId,
    }).populate("roleSlot");

    return NextResponse.json(
      {
        message: "Applications fetched successfully",
        assignments,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("MY APPLICATIONS API ERROR:", error);
    return NextResponse.json(
      { message: "Failed to fetch applications" },
      { status: 500 }
    );
  }
}
