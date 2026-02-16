import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Certificate } from "@/models/Certificate";

export async function PATCH(req: Request) {
  await connectDB();

  const { certificateId } = await req.json();

  if (!certificateId) {
    return NextResponse.json(
      { message: "certificateId is required" },
      { status: 400 }
    );
  }

  const cert = await Certificate.findOne({ certificateId });

  if (!cert) {
    return NextResponse.json(
      { message: "Certificate not found" },
      { status: 404 }
    );
  }

  cert.isRevoked = true; // ✅ FIXED (was wrong before)
  await cert.save();

  return NextResponse.json({
    message: "Certificate revoked successfully",
  });
}

