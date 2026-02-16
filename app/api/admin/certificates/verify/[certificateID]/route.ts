import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Certificate } from "@/models/Certificate";
import { Event } from "@/models/Event";
import { User } from "@/models/User";

export async function GET(
  request: Request,
  // Use "certificateID" with a capital D to match the folder name
  { params }: { params: Promise<{ certificateID: string }> } 
) {
  try {
    const { certificateID } = await params; // Extract with capital D

    if (!certificateID) {
      return NextResponse.json(
        { valid: false, message: "Certificate ID is required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Query using the extracted ID, but match your Schema field (likely certificateId)
    const certificate = await Certificate.findOne({ certificateId: certificateID })
      .populate("student", "name email")
      .populate("event", "title");

    // ... rest of your code
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
