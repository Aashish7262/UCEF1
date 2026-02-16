import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import mongoose from "mongoose";

// 🔥 VERY IMPORTANT: FORCE REGISTER MODELS
import "@/models/User";
import "@/models/Event";
import { Certificate } from "@/models/Certificate";

export async function GET(
  req: Request,
  context: { params: Promise<{ certificateId: string }> }
) {
  try {
    // ✅ FIX: unwrap params (Next.js App Router requirement)
    const { certificateId } = await context.params;

    console.log("🔍 Verifying Certificate ID:", certificateId);

    if (!certificateId) {
      return NextResponse.json(
        { message: "Certificate ID is required" },
        { status: 400 }
      );
    }

    await connectDB();

    /* ================= PRIMARY SEARCH (by certificateId) ================= */
    let cert = await Certificate.findOne({ certificateId })
      .populate("student", "name email")
      .populate("event", "title")
      .lean();

    /* ================= FALLBACK: If QR sends Mongo _id ================= */
    if (!cert && mongoose.Types.ObjectId.isValid(certificateId)) {
      console.log("⚠️ Trying fallback search using Mongo _id...");
      cert = await Certificate.findById(certificateId)
        .populate("student", "name email")
        .populate("event", "title")
        .lean();
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
