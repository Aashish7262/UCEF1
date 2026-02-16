import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Certificate } from "@/models/Certificate";
import { Event } from "@/models/Event";
import { User } from "@/models/User";

export async function GET(
  request: Request,
  // 1. Ensure this matches your folder name [certificateID] exactly
  { params }: { params: Promise<{ certificateID: string }> } 
) {
  try {
    // 2. Destructure certificateID (Capital D)
    const { certificateID } = await params;

    if (!certificateID) {
      return NextResponse.json(
        { valid: false, message: "Certificate ID is required" },
        { status: 400 }
      );
    }

    await connectDB();

    // 3. Query the DB. Note: 'certificateId' is your schema field, 
    // but 'certificateID' is the value from your URL
    const certificate = await Certificate.findOne({ certificateId: certificateID })
      .populate("student", "name email")
      .populate("event", "title");

    if (!certificate) {
      return NextResponse.json(
        { valid: false, message: "Certificate not found" },
        { status: 404 }
      );
    }

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