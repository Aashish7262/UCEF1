import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Certificate } from "@/models/Certificate";
import { Event } from "@/models/Event";
import { User } from "@/models/User";
import mongoose from "mongoose";

export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("eventId");
    const adminId = searchParams.get("adminId");

    /* ================= VALIDATION ================= */
    if (!eventId || !adminId) {
      return NextResponse.json(
        { message: "eventId and adminId are required" },
        { status: 400 }
      );
    }

    if (
      !mongoose.Types.ObjectId.isValid(eventId) ||
      !mongoose.Types.ObjectId.isValid(adminId)
    ) {
      return NextResponse.json(
        { message: "Invalid IDs" },
        { status: 400 }
      );
    }

    /* ================= FETCH USER ================= */
    const user = await User.findById(adminId);
    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    /* ================= FETCH EVENT ================= */
    const event = await Event.findById(eventId);
    if (!event) {
      return NextResponse.json(
        { message: "Event not found" },
        { status: 404 }
      );
    }

    /* ================= AUTHORIZATION FIX ================= */
    const isOrganizer =
      event.organizer?.toString() === adminId.toString();

    const isPlatformAdmin = user.role === "admin";

    // 🔥 ALLOW BOTH ADMIN AND ORGANIZER (CRITICAL FIX)
    if (!isOrganizer && !isPlatformAdmin) {
      return NextResponse.json(
        { message: "Unauthorized: Only organizer or admin allowed" },
        { status: 403 }
      );
    }

    /* ================= FETCH CERTIFICATES ================= */
    const certificates = await Certificate.find({
      event: new mongoose.Types.ObjectId(eventId),
    })
      .populate("student", "name email")
      .populate("event", "title")
      .sort({ createdAt: -1 })
      .lean();

    console.log("🎓 Certificates Found:", certificates.length);

    return NextResponse.json(
      { certificates },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET CERTIFICATES ERROR:", error);
    return NextResponse.json(
      { message: "Failed to fetch certificates" },
      { status: 500 }
    );
  }
}




