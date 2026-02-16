import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { RoleSlot } from "@/models/RoleSlot";
import { RoleAssignment } from "@/models/RoleAssignment";
import { Event } from "@/models/Event";
import { User } from "@/models/User";

export async function POST(req: Request) {
  try {
    const { studentId, roleSlotId } = await req.json();

    if (!studentId || !roleSlotId) {
      return NextResponse.json(
        { message: "studentId and roleSlotId are required" },
        { status: 400 }
      );
    }

    await connectDB();

    /* ================= VALIDATE STUDENT ================= */
    const student = await User.findById(studentId);
    if (!student || student.role !== "student") {
      return NextResponse.json(
        { message: "Only students can apply for roles" },
        { status: 403 }
      );
    }

    /* ================= GET ROLE SLOT ================= */
    const slot = await RoleSlot.findById(roleSlotId);
    if (!slot) {
      return NextResponse.json(
        { message: "Role slot not found" },
        { status: 404 }
      );
    }

    /* ================= CHECK EVENT ================= */
    const event = await Event.findById(slot.event);
    if (!event) {
      return NextResponse.json(
        { message: "Event not found" },
        { status: 404 }
      );
    }

    // 🔴 CRITICAL RULE: Only LIVE events allow applications
    if (event.status !== "live") {
      return NextResponse.json(
        { message: "You can apply only when event is live" },
        { status: 403 }
      );
    }

    // Prevent applying after event end
    const now = new Date();
    if (event.endDate && now > event.endDate) {
      return NextResponse.json(
        { message: "Event has already ended" },
        { status: 400 }
      );
    }

    /* ================= DUPLICATE SLOT CHECK ================= */
    const existingSameSlot = await RoleAssignment.findOne({
      event: slot.event,
      student: studentId,
      roleSlot: roleSlotId,
    });

    if (existingSameSlot) {
      return NextResponse.json(
        { message: "Already applied to this role slot" },
        { status: 409 }
      );
    }

    /* ================= JUDGE EXCLUSIVITY RULE ================= */
    const existingAssignments = await RoleAssignment.find({
      event: slot.event,
      student: studentId,
    });

    const hasJudge = existingAssignments.some(
      (a) => a.role === "judge"
    );

    // If student already has judge, block everything else
    if (hasJudge && slot.role !== "judge") {
      return NextResponse.json(
        { message: "Judge role is exclusive. Cannot apply for other roles." },
        { status: 400 }
      );
    }

    // If applying for judge but already has other roles → block
    if (slot.role === "judge" && existingAssignments.length > 0) {
      return NextResponse.json(
        { message: "Cannot apply for Judge after selecting other roles" },
        { status: 400 }
      );
    }

    /* ================= SEAT LIMIT CHECK ================= */
    if (slot.maxSeats > 0) {
      const approvedCount = await RoleAssignment.countDocuments({
        roleSlot: roleSlotId,
        status: "approved",
      });

      if (approvedCount >= slot.maxSeats) {
        return NextResponse.json(
          { message: "This role slot is full" },
          { status: 400 }
        );
      }
    }

    /* ================= STATUS LOGIC ================= */
    // Participant = auto approved
    // Volunteer/Judge/Speaker = pending (organizer approval)
    let status: "pending" | "approved" = "pending";

    if (slot.role === "participant") {
      status = "approved";
    }

    /* ================= CREATE ASSIGNMENT ================= */
    const assignment = await RoleAssignment.create({
      event: slot.event,
      student: studentId,
      roleSlot: roleSlotId,
      role: slot.role,
      status,
    });

    return NextResponse.json(
      {
        message:
          status === "approved"
            ? "Successfully registered as participant"
            : "Application submitted for approval",
        assignment,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("ROLE APPLY ERROR:", error);
    return NextResponse.json(
      { message: "Failed to apply for role" },
      { status: 500 }
    );
  }
}
