import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Event } from "@/models/Event";
import { User } from "@/models/User";

export async function POST(req: Request) {
  try {
    const { title, description, eventDate, endDate, userId } =
      await req.json();

    
    if (!title || !description || !eventDate || !endDate || !userId) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    const start = new Date(eventDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json(
        { message: "Invalid date format" },
        { status: 400 }
      );
    }

    if (end <= start) {
      return NextResponse.json(
        { message: "End date must be after event start date" },
        { status: 400 }
      );
    }

    await connectDB();

    // 🔹 Step 2: Verify organizer (Admin only)
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    if (user.role !== "admin") {
      return NextResponse.json(
        { message: "Only admin (organizer) can create events" },
        { status: 403 }
      );
    }

    // 🔥 Step 3: Create event (MATCHES NEW MODEL EXACTLY)
    const event = await Event.create({
      title: title.trim(),
      description: description.trim(),
      eventDate: start,
      endDate: end,
      status: "draft",          // required by workflow
      organizer: user._id,      // 🔥 NOT createdBy (fixed)
      qrEnabled: false,         // for future QR feature
    });

    return NextResponse.json(
      {
        message: "Event created successfully (Draft)",
        event,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("CREATE EVENT ERROR:", error);
    return NextResponse.json(
      { message: "Failed to create event" },
      { status: 500 }
    );
  }
}


