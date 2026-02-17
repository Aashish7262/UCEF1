import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import mongoose from "mongoose";

// Force register models to prevent population errors in serverless
import "@/models/User";
import "@/models/Event";
import { Certificate } from "@/models/Certificate";

// Interface for clean Lean documents
interface PopulatedCert {
  certificateId: string;
  role: string;
  isRevoked: boolean;
  createdAt: Date;
  student?: { name: string; email: string };
  event?: { title: string };
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ certificateID: string }> } 
) {
  try {
    // 1. Await and extract exactly as defined in the type above
    const { certificateID } = await params;

    if (!certificateID) {
      return NextResponse.json(
        { valid: false, message: "Certificate ID is required" },
        { status: 400 }
      );
    }

    await connectDB();

    /* ================= PRIMARY SEARCH ================= */
    // Search the 'certificateId' field in DB using 'certificateID' from the URL
    let cert = await Certificate.findOne({ certificateId: certificateID })
      .populate("student", "name email")
      .populate("event", "title")
      .lean() as unknown as PopulatedCert;

    /* ================= FALLBACK: Search by Mongo _id ================= */
    if (!cert && mongoose.Types.ObjectId.isValid(certificateID)) {
      cert = await Certificate.findById(certificateID)
        .populate("student", "name email")
        .populate("event", "title")
        .lean() as unknown as PopulatedCert;
    }

    /* ================= NOT FOUND ================= */
    if (!cert) {
      return NextResponse.json(
        { message: "Certificate not found", valid: false },
        { status: 404 }
      );
    }

    /* ================= REVOKED CHECK ================= */
    if (cert.isRevoked) {
      return NextResponse.json({
        valid: false,
        revoked: true,
        message: "Certificate has been revoked",
        student: cert.student?.name,
        event: cert.event?.title,
        role: cert.role,
        certificateId: cert.certificateId,
        issuedAt: cert.createdAt,
      });
    }

    /* ================= SUCCESS ================= */
    return NextResponse.json({
      valid: true,
      certificate: {
        certificateId: cert.certificateId,
        role: cert.role,
        studentName: cert.student?.name,
        email: cert.student?.email,
        eventTitle: cert.event?.title,
        issuedAt: cert.createdAt,
      },
    });
  } catch (error) {
    console.error("❌ VERIFY CERTIFICATE ERROR:", error);
    return NextResponse.json(
      { message: "Server error during verification", valid: false },
      { status: 500 }
    );
  }
}