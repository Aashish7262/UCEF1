import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Certificate } from "@/models/Certificate";
import { Event } from "@/models/Event";
import { User } from "@/models/User";

export async function GET(
  req: Request,
  { params }: { params: { certificateId: string } }
) {
  try {
    const { certificateId } = params;

    if (!certificateId) {
      return NextResponse.json(
        { valid: false, message: "Certificate ID is required" },
        { status: 400 }
      );
    }

    await connectDB();

    // 🔍 Find certificate with populated data
    const certificate = await Certificate.findOne({ certificateId })
      .populate("student", "name email")
      .populate("event", "title");

    // ❌ Certificate not found = INVALID
    if (!certificate) {
      return NextResponse.json(
        {
          valid: false,
          message: "Certificate not found",
        },
        { status: 404 }
      );
    }

    // 🚨 CRITICAL: Check if revoked
    if (certificate.isRevoked) {
      return NextResponse.json(
        {
          valid: false,
          message: "Certificate has been revoked",
          revoked: true,
        },
        { status: 200 }
      );
    }

    // ✅ VALID CERTIFICATE RESPONSE
    return NextResponse.json(
      {
        valid: true,
        certificateId: certificate.certificateId,
        student: certificate.student?.name,
        email: certificate.student?.email,
        event: certificate.event?.title,
        role: certificate.role,
        issuedAt: certificate.createdAt,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("VERIFY CERTIFICATE ERROR:", error);
    return NextResponse.json(
      { valid: false, message: "Verification failed" },
      { status: 500 }
    );
  }
}
