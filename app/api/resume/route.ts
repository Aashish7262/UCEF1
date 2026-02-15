import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import  {Resume } from "@/models/Resume";

export async function POST(req: Request) {
  try {
    await connectDB();

    const data = await req.json();

    const resume = await Resume.findOneAndUpdate(
      { userId: data.userId },
      { ...data },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true, resume });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, message: "Resume save failed" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ resume: null });
    }

    const resume = await Resume.findOne({ userId });

    return NextResponse.json({ resume });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false },
      { status: 500 }
    );
  }
}