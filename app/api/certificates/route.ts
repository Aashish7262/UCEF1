import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Certificate } from "@/models/Certificate";
import { Event } from "@/models/Event";
import { User } from "@/models/User";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("eventId");
    const adminId = searchParams.get("adminId");

    if (!eventId || !adminId) {
      return NextResponse.json(
        { message: "eventId and adminId are required" },
        { status: 400 }
      );
    }

    await connectDB();

    // 🔒 Check admin
    const admin = await User.findById(adminId);
    if (!admin || admin.role !== "admin") {
      return NextResponse.json(
        { message: "Only admin can view certificates" },
        { status: 403 }
      );
    }

    // 🔒 Check event ownership
    const event = await Event.findById(eventId);
    if (!event) {
      return NextResponse.json(
        { message: "Event not found" },
        { status: 404 }
      );
    }

    if (event.organizer.toString() !== admin._id.toString()) {
      return NextResponse.json(
        { message: "You are not the organizer of this event" },
        { status: 403 }
      );
    }

    // 📜 Fetch certificates
    const certificates = await Certificate.find({ event: eventId })
      .populate("student", "name email")
      .populate("event", "title")
      .sort({ createdAt: -1 });

    return NextResponse.json(
      { certificates },
      { status: 200 }
    );
  } catch (error) {
    console.error("ADMIN CERTIFICATES ERROR:", error);
    return NextResponse.json(
      { message: "Failed to fetch certificates" },
      { status: 500 }
    );
  }
}
