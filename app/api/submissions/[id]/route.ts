import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Submission from "@/models/Submission";
import mongoose from "mongoose";

export async function GET(
 req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid hackathon ID" },
        { status: 400 }
      );
    }

    const submissions = await Submission.find({
      hackathon: id,
    }).populate("team", "name");

    return NextResponse.json({ submissions });

  } catch (error: any) {
    console.error("FETCH SUBMISSIONS ERROR:", error);
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}
