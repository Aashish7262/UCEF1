import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import mongoose from "mongoose";

// 🔥 VERY IMPORTANT: FORCE REGISTER MODELS
import "@/models/User";
import "@/models/Event";
import { Certificate } from "@/models/Certificate";
<<<<<<< HEAD
=======
import { Event } from "@/models/Event";
import { User } from "@/models/User";
>>>>>>> 20a01f540c051f8e17825adaaf779df3ce9bf7e1

export async function GET(
  request: Request,
  // 1. MUST match your folder name [certificateID] exactly for the build to pass
  { params }: { params: Promise<{ certificateID: string }> } 
) {
  try {
<<<<<<< HEAD
    // ✅ FIX: unwrap params (Next.js App Router requirement)
    const { certificateId } = await context.params;
=======
    // 2. Extract with capital 'ID' from the promise
    const { certificateID } = await params;

    if (!certificateID) {
      return NextResponse.json(
        { valid: false, message: "Certificate ID is required" },
        { status: 400 }
      );
    }
>>>>>>> 20a01f540c051f8e17825adaaf779df3ce9bf7e1

    console.log("🔍 Verifying Certificate ID:", certificateId);

    if (!certificateId) {
      return NextResponse.json(
        { message: "Certificate ID is required" },
        { status: 400 }
      );
    }

    await connectDB();

<<<<<<< HEAD
    /* ================= PRIMARY SEARCH (by certificateId) ================= */
    let cert = await Certificate.findOne({ certificateId })
=======
    // 3. Query the DB. We use certificateID (from URL) to find certificateId (in MongoDB)
    const certificate = await Certificate.findOne({ certificateId: certificateID })
>>>>>>> 20a01f540c051f8e17825adaaf779df3ce9bf7e1
      .populate("student", "name email")
      .populate("event", "title");

<<<<<<< HEAD
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
=======
    // ❌ Handle Certificate Not Found
    if (!certificate) {
      return NextResponse.json(
        {
          valid: false,
          message: "Certificate not found",
        },
>>>>>>> 20a01f540c051f8e17825adaaf779df3ce9bf7e1
        { status: 404 }
      );
    }

<<<<<<< HEAD
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
=======
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
>>>>>>> 20a01f540c051f8e17825adaaf779df3ce9bf7e1
  } catch (error) {
    console.error("❌ VERIFY CERTIFICATE ERROR:", error);
    return NextResponse.json(
<<<<<<< HEAD
      { message: "Server error during verification", valid: false },
=======
      { valid: false, message: "Verification failed" },
>>>>>>> 20a01f540c051f8e17825adaaf779df3ce9bf7e1
      { status: 500 }
    );
  }
}
