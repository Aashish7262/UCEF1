import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Event } from "@/models/Event";

export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role");

    const now = new Date();

    let events;

    
    if (role === "admin") {
      events = await Event.find().sort({ createdAt: -1 });
    }
   
    else {
      events = await Event.find({
  status: "live",
  $or: [
    { endDate: { $exists: false } },   
    { endDate: { $gte: now } },        
  ],
}).sort({ createdAt: -1 });
    }

    return NextResponse.json({ events }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

