import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Event } from "@/models/Event";
import { RoleAssignment } from "@/models/RoleAssignment";
import { Attendance } from "@/models/Attendance";
import { User } from "@/models/User";
import { Certificate } from "@/models/Certificate"; // 🔥 NEW
import { generateCertificate } from "@/lib/certificate";
import { transporter } from "@/lib/mailer";
import crypto from "crypto";

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
      event: eventId,
      student: studentId,
      status: "approved",
    });

    if (approvedAssignments.length === 0) {
      return NextResponse.json(
        { message: "No approved roles found for attendance" },
        { status: 403 }
      );
    }

    /* ================= ROLE-BASED ATTENDANCE (NO DUPLICATES) ================= */
    const newlyCreatedCertificates: string[] = [];
    const newlyMarkedRoles: string[] = [];

    for (const assignment of approvedAssignments) {
      const role = assignment.role;

      // 🔒 Prevent duplicate attendance per role
      const existingAttendance = await Attendance.findOne({
        event: eventId,
        student: studentId,
        role,
      });

      if (existingAttendance) {
        console.log(`⚠️ Attendance already exists for role: ${role}`);
        continue;
      }

      /* ================= CREATE ATTENDANCE ================= */
      const attendance = await Attendance.create({
        event: eventId,
        student: studentId,
        role,
        status: "present",
      });

      newlyMarkedRoles.push(role);

      /* ================= CHECK IF CERTIFICATE ALREADY EXISTS ================= */
      const existingCertificate = await Certificate.findOne({
        event: eventId,
        student: studentId,
        role,
      });

      if (existingCertificate) {
        console.log(`🎓 Certificate already exists for role: ${role}`);
        continue;
      }

      /* ================= GENERATE UNIQUE CERTIFICATE ID ================= */
      const certificateId = `CERT-${crypto.randomUUID()}`;

      /* ================= SAVE CERTIFICATE IN DB (VERY IMPORTANT) ================= */
      await Certificate.create({
        certificateId,
        event: eventId,
        student: studentId,
        role,
        attendance: attendance._id,
        fileUrl: "email-pdf", // can be S3 later
      });

      newlyCreatedCertificates.push(role);

      /* ================= GENERATE BEAUTIFUL CERTIFICATE ================= */
      const eventDate = new Date(event.endDate).toDateString();

      const pdfBytes = await generateCertificate({
        studentName: student.name,
        eventTitle: event.title,
        role,
        date: eventDate,
        certificateId, // 🔥 REAL ID USED IN QR
      });

      /* ================= SEND EMAIL ================= */
      try {
        const mailInfo = await transporter.sendMail({
          from: `"HackathonHub" <${process.env.EMAIL_USER}>`,
          to: student.email,
          subject: `🎓 Verified Certificate - ${event.title} (${role})`,
          text: `Hello ${student.name},

Congratulations! 🎉

Your attendance has been successfully verified for:
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

