import { NextResponse } from "next/server";
import {connectDB }from "@/lib/db";
import Hackathon from "@/models/Hackathon";

export async function PATCH(
 req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

   const { id } = await params;

    const hackathon = await Hackathon.findById(id);

    if (!hackathon) {
      return NextResponse.json(
        { message: "Hackathon not found" },
        { status: 404 }
      );
    }

    hackathon.status = "completed";
    await hackathon.save();

    return NextResponse.json({
      message: "Results published successfully",
    });

  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}
