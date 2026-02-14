import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Hackathon from "@/models/Hackathon";
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

    const hackathon = await Hackathon.findById(id);

    if (!hackathon) {
      return NextResponse.json(
        { message: "Hackathon not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ hackathon });

  } catch (error: any) {
    console.error("GET HACKATHON ERROR:", error);
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}
