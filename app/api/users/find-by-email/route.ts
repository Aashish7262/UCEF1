import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import{User} from "@/models/User";

export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { message: "User not found with this email" },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });

  } catch (error: any) {
    console.error("FIND USER ERROR:", error);
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}
