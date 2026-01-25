import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Certificate } from "@/models/Certificate";

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

    const certificates = await Certificate.find({
      student: studentId,
    }).lean();

    return NextResponse.json(
      { certificates },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to fetch certificates" },
      { status: 500 }
    );
  }
}
