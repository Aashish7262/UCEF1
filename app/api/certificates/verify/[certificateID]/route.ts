import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Certificate } from "@/models/Certificate";
import { User } from "@/models/User";
import { Event } from "@/models/Event";

export async function GET(
  req: Request,
  context: { params: Promise<{ certificateId: string }> }
) {
  try {
    const { certificateId } = await context.params;

    await connectDB();

    const cert = await Certificate.findOne({ certificateId })
      .populate("student", "name email")
      .populate("event", "title")
      .lean();

    // ❌ NOT FOUND = INVALID
    if (!cert) {
      return NextResponse.json(
        { valid: false, reason: "not_found" },
        { status: 404 }
      );
    }

    // 🚫 REVOKED CERTIFICATE
    if (cert.isRevoked) {
      return NextResponse.json({
        valid: false,
        reason: "revoked",
        student: cert.student?.name,
        event: cert.event?.title,
        role: cert.role,
        issuedAt: cert.createdAt,
      });
    }

    // ✅ VALID CERTIFICATE
    return NextResponse.json({
      valid: true,
      student: cert.student?.name,
      email: cert.student?.email,
      event: cert.event?.title,
      role: cert.role,
      issuedAt: cert.createdAt,
      certificateId: cert.certificateId,
    });
  } catch (error) {
    console.error("VERIFY CERTIFICATE ERROR:", error);
    return NextResponse.json(
      { valid: false, reason: "server_error" },
      { status: 500 }
    );
  }
}
