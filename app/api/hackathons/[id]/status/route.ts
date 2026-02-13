import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Hackathon from "@/models/Hackathon";
import { User } from "@/models/User";
import mongoose from "mongoose";

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await context.params;
    const { status, userId } = await req.json();

    /* ===== VALIDATE IDS ===== */
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid hackathon ID" },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { message: "Invalid user ID" },
        { status: 400 }
      );
    }

    /* ===== CHECK ADMIN ===== */
    const user = await User.findById(userId);
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { message: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }

    /* ===== FIND HACKATHON ===== */
    const hackathon = await Hackathon.findById(id);
    if (!hackathon) {
      return NextResponse.json(
        { message: "Hackathon not found" },
        { status: 404 }
      );
    }

    /* ===== STRICT PHASE FLOW (NO SKIPPING) ===== */
    const allowedTransitions: Record<string, string[]> = {
      draft: ["registration-open"],
      "registration-open": ["registration-closed"],
      "registration-closed": ["submission-open"],
      "submission-open": ["evaluation"],
      evaluation: ["completed"],
      completed: [],
    };

    if (!allowedTransitions[hackathon.status]?.includes(status)) {
      return NextResponse.json(
        {
          message: `Invalid transition from ${hackathon.status} to ${status}`,
        },
        { status: 400 }
      );
    }

    /* ===== DATE VALIDATION (ANTI-CHEAT / REAL SYSTEM LOGIC) ===== */
    const today = new Date();

    // (Make sure your Hackathon model has these fields)
    const registrationStart = hackathon.registrationStartDate;
    const registrationEnd = hackathon.registrationEndDate;
    const submissionStart = hackathon.submissionStartDate;
    const submissionEnd = hackathon.submissionEndDate;

    // Registration Open validation
    if (status === "registration-open" && registrationStart) {
      if (today < new Date(registrationStart)) {
        return NextResponse.json(
          { message: "Registration cannot open before start date" },
          { status: 400 }
        );
      }
    }

    // Registration Closed validation
    if (status === "registration-closed" && registrationEnd) {
      if (today < new Date(registrationEnd)) {
        return NextResponse.json(
          { message: "Cannot close registration before end date" },
          { status: 400 }
        );
      }
    }

    // Submission Open validation
    if (status === "submission-open" && submissionStart) {
      if (today < new Date(submissionStart)) {
        return NextResponse.json(
          { message: "Submission phase not started yet" },
          { status: 400 }
        );
      }
    }

    // Evaluation validation
    if (status === "evaluation" && submissionEnd) {
      if (today < new Date(submissionEnd)) {
        return NextResponse.json(
          { message: "Cannot start evaluation before submission deadline" },
          { status: 400 }
        );
      }
    }

    /* ===== UPDATE STATUS ===== */
    hackathon.status = status;
    await hackathon.save();

    return NextResponse.json({ hackathon });
  } catch (error: any) {
    console.error("STATUS UPDATE ERROR:", error);
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}
