import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Certificate } from "@/models/Certificate";
import { Event } from "@/models/Event";
import { User } from "@/models/User";

export async function GET(
  request: Request,
  // 1. MUST match your folder name [certificateID] exactly for the build to pass
  { params }: { params: Promise<{ certificateID: string }> } 
) {
  try {
    // 2. Extract with capital 'ID' from the promise
    const { certificateID } = await params;

    if (!certificateID) {
      return NextResponse.json(
        { valid: false, message: "Certificate ID is required" },
        { status: 400 }
      );
    }

    await connectDB();

    // 3. Query the DB. We use certificateID (from URL) to find certificateId (in MongoDB)
    const certificate = await Certificate.findOne({ certificateId: certificateID })
      .populate("student", "name email")
      .populate("event", "title");

    // ❌ Handle Certificate Not Found
    if (!certificate) {
      return NextResponse.json(
        {
          valid: false,
          message: "Certificate not found",
        },
        { status: 404 }
      );
    }

    // 🚨 Handle Revoked Certificate
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

    // ✅ Success Response
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
