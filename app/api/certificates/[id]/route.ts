import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Certificate } from "@/models/Certificate";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params; 

    await connectDB();

    const certificate = await Certificate.findById(id)
      .populate("student", "name email")
      .populate("event", "title eventDate")
      .lean();

    if (!certificate) {
      return NextResponse.json(
        { message: "Certificate not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { certificate },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET CERTIFICATE ERROR:", error);
    return NextResponse.json(
      { message: "Failed to fetch certificate" },
      { status: 500 }
    );
  }
}

