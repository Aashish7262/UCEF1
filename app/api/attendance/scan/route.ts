import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Event } from "@/models/Event";
import { RoleAssignment } from "@/models/RoleAssignment";
import { Attendance } from "@/models/Attendance";
import { User } from "@/models/User";
import { generateCertificate } from "@/lib/certificate";
import { transporter } from "@/lib/mailer";

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

    /* ================= TIME SECURITY (REALISTIC) ================= */
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
    const newlyMarkedAttendances = [];

    for (const assignment of approvedAssignments) {
      const role = assignment.role;

      // 🔒 Prevent duplicate attendance for SAME role + student + event
      const existingAttendance = await Attendance.findOne({
        event: eventId,
        student: studentId,
        role: role,
      });

      if (existingAttendance) {
        console.log(
          `⚠️ Attendance already exists for role: ${role}, skipping`
        );
        continue; // Skip duplicate role attendance
      }

      // ✅ Create attendance ONLY if not already marked
      const attendance = await Attendance.create({
        event: eventId,
        student: studentId,
        role: role,
        status: "present",
      });

      newlyMarkedAttendances.push(attendance);
    }

    /* ================= IF NOTHING NEW MARKED ================= */
    if (newlyMarkedAttendances.length === 0) {
      return NextResponse.json(
        {
          message:
            "Attendance already marked for all approved roles (No duplicates allowed)",
        },
        { status: 200 }
      );
    }

    /* ================= SEND CERTIFICATES (ONLY NEW ROLES) ================= */
    try {
      const eventDate = new Date(event.endDate).toDateString();

      for (const attendance of newlyMarkedAttendances) {
        const role = attendance.role;

        console.log(
          `📧 Generating certificate for ${student.email} | Role: ${role}`
        );

        // 🎓 Generate PDF Certificate
        const pdfBytes = await generateCertificate({
          studentName: student.name,
          eventTitle: event.title,
          role: role,
          date: eventDate,
        });

        // 📩 Send Email with Certificate
        const mailInfo = await transporter.sendMail({
          from: `"HackathonHub" <${process.env.EMAIL_USER}>`,
          to: student.email,
          subject: `🎓 Certificate - ${event.title} (${role})`,
          text: `Hello ${student.name},

Congratulations! 🎉

Your attendance has been successfully marked for the role: ${role} in the event "${event.title}".

Please find your certificate attached.

Best Regards,  
HackathonHub Team 🚀`,
          attachments: [
            {
              filename: `Certificate-${event.title}-${role}.pdf`,
              content: Buffer.from(pdfBytes),
              contentType: "application/pdf",
            },
          ],
        });

        console.log(
          "✅ Certificate email sent:",
          mailInfo.messageId
        );
      }
    } catch (mailError) {
      // ⚠️ Do NOT fail attendance if email fails (production best practice)
      console.error("❌ CERTIFICATE EMAIL ERROR:", mailError);
    }

    /* ================= FINAL RESPONSE ================= */
    return NextResponse.json(
      {
        message:
          "Attendance marked successfully & certificates sent for new roles",
        rolesMarked: newlyMarkedAttendances.map(
          (a) => a.role
        ),
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
