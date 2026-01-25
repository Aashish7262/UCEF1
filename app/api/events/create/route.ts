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

    if (end < start) {
      return NextResponse.json(
        { message: "End date must be after event date" },
        { status: 400 }
      );
    }

    await connectDB();

    
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

   
    if (user.role !== "admin") {
      return NextResponse.json(
        { message: "Only admin can create events" },
        { status: 403 }
      );
    }

    
    const event = await Event.create({
      title,
      description,
      eventDate: start,
      endDate: end,
      status: "draft",
      createdBy: user._id,
    });

    return NextResponse.json(
      {
        message: "Event created successfully",
        event,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to create event" },
      { status: 500 }
    );
  }
}

