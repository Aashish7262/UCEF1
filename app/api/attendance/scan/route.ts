import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Event } from "@/models/Event";
import { RoleAssignment } from "@/models/RoleAssignment";
import { Attendance } from "@/models/Attendance";
import { User } from "@/models/User";
import { Certificate } from "@/models/Certificate";
import { generateCertificate } from "@/lib/certificate";
import { transporter } from "@/lib/mailer";
import crypto from "crypto";
import mongoose from "mongoose";

export async function POST(req: Request) {
  try {
    const { eventId, studentId } = await req.json();

    /* ================= VALIDATION ================= */
    if (!eventId || !studentId) {
      return NextResponse.json(
        { message: "eventId and studentId are required" },
        { status: 400 }
      );
    }

    await connectDB();

    /* ================= CHECK STUDENT ================= */
    const student = await User.findById(studentId);
    if (!student || student.role !== "student") {
      return NextResponse.json(
        { message: "Invalid student" },
        { status: 403 }
      );
    }

    /* ================= CHECK EVENT ================= */
    const event = await Event.findById(eventId);
    if (!event) {
      return NextResponse.json(
        { message: "Event not found" },
        { status: 404 }
      );
    }

    /* ================= EVENT MUST BE LIVE ================= */
    if (event.status !== "live") {
      return NextResponse.json(
        { message: "Event is not live" },
        { status: 400 }
      );
    }

    /* ================= QR MUST BE ENABLED ================= */
    if (!event.qrEnabled) {
      return NextResponse.json(
        { message: "QR attendance is not active" },
        { status: 400 }
      );
    }

    /* ================= TIME SECURITY ================= */
    const now = new Date();
    const end = new Date(event.endDate);
    if (now > end) {
      return NextResponse.json(
        { message: "Event has already ended" },
        { status: 400 }
      );
    }

    /* ================= GET APPROVED ROLES ================= */
    const approvedAssignments = await RoleAssignment.find({
      event: new mongoose.Types.ObjectId(eventId),
      student: new mongoose.Types.ObjectId(studentId),
      status: "approved",
    });

    if (approvedAssignments.length === 0) {
      return NextResponse.json(
        { message: "No approved roles found for attendance" },
        { status: 403 }
      );
    }

    /* ================= ROLE-BASED ATTENDANCE ================= */
    const newlyCreatedCertificates: string[] = [];
    const newlyMarkedRoles: string[] = [];

    for (const assignment of approvedAssignments) {
      const role = assignment.role;

      /* ================= PREVENT DUPLICATE ATTENDANCE ================= */
      const existingAttendance = await Attendance.findOne({
        event: new mongoose.Types.ObjectId(eventId),
        student: new mongoose.Types.ObjectId(studentId),
        role,
      });

      if (existingAttendance) {
        console.log(`⚠️ Attendance already exists for role: ${role}`);
        continue;
      }

      /* ================= CREATE ATTENDANCE ================= */
      const attendance = await Attendance.create({
        event: new mongoose.Types.ObjectId(eventId),
        student: new mongoose.Types.ObjectId(studentId),
        role,
        status: "present",
      });

      newlyMarkedRoles.push(role);

      /* ================= CHECK IF CERTIFICATE ALREADY EXISTS ================= */
      const existingCertificate = await Certificate.findOne({
        event: new mongoose.Types.ObjectId(eventId),
        student: new mongoose.Types.ObjectId(studentId),
        role,
      });

      if (existingCertificate) {
        console.log(`🎓 Certificate already exists for role: ${role}`);
        continue;
      }

      /* ================= GENERATE UNIQUE CERTIFICATE ID ================= */
      const certificateId = `CERT-${crypto.randomUUID()}`;

      /* ================= SAVE CERTIFICATE IN DB (CRITICAL FIX) ================= */
      try {
        await Certificate.create({
          certificateId,
          // 🔥 VERY IMPORTANT: store as ObjectId (NOT string)
          event: new mongoose.Types.ObjectId(eventId),
          student: new mongoose.Types.ObjectId(studentId),
          role,
          attendance: attendance._id,
          fileUrl: "email-pdf",
          isRevoked: false,
        });

        newlyCreatedCertificates.push(role);
        console.log("✅ Certificate saved in DB for role:", role);
      } catch (certError: any) {
        // Prevent crash on duplicate key
        if (certError.code === 11000) {
          console.log("⚠️ Duplicate certificate prevented safely");
        } else {
          throw certError;
        }
      }

      /* ================= GENERATE CERTIFICATE PDF ================= */
      const eventDate = new Date(event.endDate).toDateString();

      const pdfBytes = await generateCertificate({
        studentName: student.name,
        eventTitle: event.title,
        role,
        date: eventDate,
        certificateId,
      });

      /* ================= SEND EMAIL WITH CERTIFICATE ================= */
      try {
        const mailInfo = await transporter.sendMail({
          from: `"HackathonHub" <${process.env.EMAIL_USER}>`,
          to: student.email,
          subject: `🎓 Verified Certificate - ${event.title} (${role})`,
          text: `Hello ${student.name},

Congratulations! 🎉

Your attendance has been successfully verified.

Event: ${event.title}
Role: ${role}

Your certificate is attached.
You can verify authenticity by scanning the QR on the certificate.

Regards,
HackathonHub Team 🚀`,
          attachments: [
            {
              filename: `Certificate-${event.title}-${role}.pdf`,
              content: Buffer.from(pdfBytes),
              contentType: "application/pdf",
            },
          ],
        });

        console.log("✅ Certificate email sent:", mailInfo.messageId);
      } catch (mailError) {
        console.error("❌ EMAIL ERROR:", mailError);
      }
    }

    /* ================= NOTHING NEW ================= */
    if (newlyMarkedRoles.length === 0) {
      return NextResponse.json(
        {
          message:
            "Attendance already marked for all approved roles (No duplicates allowed)",
        },
        { status: 200 }
      );
    }

    /* ================= FINAL RESPONSE ================= */
    return NextResponse.json(
      {
        message:
          "Attendance marked & verified certificates generated successfully",
        rolesMarked: newlyMarkedRoles,
        certificatesGenerated: newlyCreatedCertificates,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("SCAN ATTENDANCE ERROR:", error);
    return NextResponse.json(
      { message: "Failed to mark attendance" },
      { status: 500 }
    );
  }
}
