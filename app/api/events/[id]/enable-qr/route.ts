import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Event } from "@/models/Event";
import { User } from "@/models/User";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> } // ✅ CORRECT FOR YOUR NEXT VERSION
) {
  try {
    // 🔥 MUST AWAIT PARAMS (CRITICAL FIX)
    const { id: eventId } = await params;

    const { userId, qrEnabled } = await req.json();

    console.log("🔍 Enable QR Request:", {
      eventId,
      userId,
      qrEnabled,
    });

    /* ================= VALIDATION ================= */
    if (!eventId) {
      return NextResponse.json(
        { message: "Event ID is required" },
        { status: 400 }
      );
    }

    if (!userId || typeof qrEnabled !== "boolean") {
      return NextResponse.json(
        { message: "userId and qrEnabled are required" },
        { status: 400 }
      );
    }

    await connectDB();

    /* ================= CHECK ADMIN ================= */
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    if (user.role !== "admin") {
      return NextResponse.json(
        { message: "Only admin can control QR attendance" },
        { status: 403 }
      );
    }

    /* ================= FIND EVENT ================= */
    const event = await Event.findById(eventId);

    if (!event) {
      return NextResponse.json(
        { message: "Event not found" },
        { status: 404 }
      );
    }

    /* ================= ORGANIZER CHECK ================= */
    // Your schema uses: organizer (NOT createdBy)
    if (event.organizer.toString() !== user._id.toString()) {
      return NextResponse.json(
        { message: "You are not the organizer of this event" },
        { status: 403 }
      );
    }

    /* ================= EVENT MUST BE LIVE ================= */
    if (event.status !== "live") {
      return NextResponse.json(
        { message: "Event must be live before enabling QR" },
        { status: 400 }
      );
    }

    /* ================= OPTIONAL: PREVENT AFTER END ================= */
    const now = new Date();
    if (now > new Date(event.endDate)) {
      return NextResponse.json(
        { message: "Event already ended. Cannot enable QR." },
        { status: 400 }
      );
    }

    /* ================= UPDATE QR STATUS ================= */
    event.qrEnabled = qrEnabled;
    await event.save();

    return NextResponse.json(
      {
        message: qrEnabled
          ? "QR attendance enabled successfully"
          : "QR attendance disabled successfully",
        event,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ ENABLE QR ERROR:", error);
    return NextResponse.json(
      {
        message: "Failed to update QR status",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

