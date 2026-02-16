import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Event } from "@/models/Event";
import { RoleAssignment } from "@/models/RoleAssignment";
import { Attendance } from "@/models/Attendance";
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

    // 1️⃣ Check student exists
    const student = await User.findById(studentId);
    if (!student || student.role !== "student") {
      return NextResponse.json(
        { message: "Invalid student" },
        { status: 403 }
      );
    }

    // 2️⃣ Check event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return NextResponse.json(
        { message: "Event not found" },
        { status: 404 }
      );
    }

    // 3️⃣ Event must be live
    if (event.status !== "live") {
      return NextResponse.json(
        { message: "Event is not live" },
        { status: 400 }
      );
    }

    // 4️⃣ QR must be enabled (released by organizer)
    if (!event.qrEnabled) {
      return NextResponse.json(
        { message: "QR attendance is not active" },
        { status: 400 }
      );
    }

    // 5️⃣ Find APPROVED role assignments for this student
    const approvedAssignments = await RoleAssignment.find({
      event: eventId,
      student: studentId,
      status: "approved",
    });

    if (approvedAssignments.length === 0) {
      return NextResponse.json(
        { message: "No approved roles found for attendance" },
        { status: 403 }
      );
    }

    const attendanceResults = [];

    // 6️⃣ Mark attendance PER ROLE (Option A - Professional Logic)
    for (const assignment of approvedAssignments) {
      // Check if already marked
      const existingAttendance = await Attendance.findOne({
        event: eventId,
        student: studentId,
        role: assignment.role,
      });

      if (!existingAttendance) {
        const attendance = await Attendance.create({
          event: eventId,
          student: studentId,
          role: assignment.role,
          status: "present",
        });

        attendanceResults.push(attendance);
      }
    }

    if (attendanceResults.length === 0) {
      return NextResponse.json(
        { message: "Attendance already marked for all approved roles" },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        message: "Attendance marked successfully",
        rolesMarked: attendanceResults.map((a) => a.role),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("SCAN ATTENDANCE ERROR:", error);
    return NextResponse.json(
      { message: "Failed to mark attendance" },
      { status: 500 }
    );
  }
}
