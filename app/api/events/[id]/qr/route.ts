import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Event } from "@/models/Event";
import { User } from "@/models/User";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { userId, qrEnabled } = await req.json();

    if (!userId || typeof qrEnabled !== "boolean") {
      return NextResponse.json(
        { message: "userId and qrEnabled are required" },
        { status: 400 }
      );
    }

    await connectDB();

    // 🔍 Check user
    const user = await User.findById(userId);
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { message: "Only admin can control QR" },
        { status: 403 }
      );
    }

    // 🔍 Find event
    const event = await Event.findById(id);
    if (!event) {
      return NextResponse.json(
        { message: "Event not found" },
        { status: 404 }
      );
    }

    // ⚠️ IMPORTANT: Your schema uses ORGANIZER (not createdBy)
    if (event.organizer.toString() !== user._id.toString()) {
      return NextResponse.json(
        { message: "You are not the organizer of this event" },
        { status: 403 }
      );
    }

    // ⏱ Optional: prevent QR after event ended
    const now = new Date();
    if (now > event.endDate) {
      return NextResponse.json(
        { message: "Event already ended. Cannot enable QR." },
        { status: 400 }
      );
    }

    // 🔥 Toggle QR
    event.qrEnabled = qrEnabled;
    await event.save();

    return NextResponse.json(
      {
        message: qrEnabled
          ? "QR released successfully"
          : "QR disabled successfully",
        event,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("QR Toggle Error:", error);
    return NextResponse.json(
      { message: "Failed to update QR status" },
      { status: 500 }
    );
  }
}
