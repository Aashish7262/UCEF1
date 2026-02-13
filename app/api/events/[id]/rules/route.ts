import { NextResponse } from "next/server";
import mongoose from "mongoose";
import {connectDB} from "@/lib/db";
import { EventRules } from "@/models/EventRules";
import { Event } from "@/models/Event"; 

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    
    const { id: eventId } = await params;

    
    const role = req.headers.get("x-role");
    if (role !== "admin") {
      return NextResponse.json(
        { error: "Only admin can create or update rules" },
        { status: 403 }
      );
    }

   
    const eventExists = await Event.findById(eventId);
    if (!eventExists) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    const { rules } = await req.json();

    if (!Array.isArray(rules) || rules.length === 0) {
      return NextResponse.json(
        { error: "Rules must be a non-empty array" },
        { status: 400 }
      );
    }

    const formattedRules = rules.map((rule, index) => ({
      text: rule.text.trim(),
      order: index + 1,
    }));

    await EventRules.findOneAndUpdate(
      { eventId },
      { eventId, rules: formattedRules },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      message: "Event rules saved successfully",
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id: eventId } = await params;

    const eventRules = await EventRules.findOne({ eventId });

    return NextResponse.json({
      rules: eventRules ? eventRules.rules : [],
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}
