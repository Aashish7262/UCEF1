import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";

export async function POST(req: Request) {
  try {
    const { name, email, password, role } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    await connectDB();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 400 }
      );
    }

    const user = await User.create({
      name,
      email,
      password, 
      role: role || "student",
    });

    return NextResponse.json(
      {
        message: "Signup successful",
        userId: user._id,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Signup failed" },
      { status: 500 }
    );
  }
}
