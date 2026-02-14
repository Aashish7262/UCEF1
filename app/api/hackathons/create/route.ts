import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Hackathon from "@/models/Hackathon";
import mongoose from "mongoose";

/* ================= CREATE HACKATHON ================= */

export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json();
    const {
  title,
  description,
  rules,
  teamSizeMin,
  teamSizeMax,
  registrationStart,
  registrationDeadline,
  hackathonStart,
  hackathonEnd,
  submissionDeadline,
  userId,
  paymentRequired,
  entryFee,
} = body;


    if (!title || !description || !userId) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    if (teamSizeMin > teamSizeMax) {
      return NextResponse.json(
        { message: "Minimum team size cannot exceed maximum" },
        { status: 400 }
      );
    }

    const hackathon = await Hackathon.create({
  title,
  description,
  rules,
  teamSizeMin,
  teamSizeMax,
  registrationStart,
  registrationDeadline,
  hackathonStart,
  hackathonEnd,
  submissionDeadline,
  paymentRequired: paymentRequired ?? false,
  entryFee: entryFee ?? 0,
  status: "draft",
  createdBy: new mongoose.Types.ObjectId(userId),
});


    return NextResponse.json({ hackathon }, { status: 201 });

  } catch (error) {
    console.error("CREATE ERROR:", error);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}

/* ================= GET HACKATHONS ================= */

export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role");
    const userId = searchParams.get("userId");

    let hackathons;

    if (role === "admin" && userId) {
      hackathons = await Hackathon.find({
        createdBy: new mongoose.Types.ObjectId(userId),
      }).sort({ createdAt: -1 });
    }

    else if (role === "student") {
      hackathons = await Hackathon.find({
        status: { $ne: "draft" },
      }).sort({ createdAt: -1 });
    }

    else {
      return NextResponse.json(
        { message: "Invalid role" },
        { status: 400 }
      );
    }

    return NextResponse.json({ hackathons });

  } catch (error: any) {
    console.error("GET ERROR:", error);
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}


