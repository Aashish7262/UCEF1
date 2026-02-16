import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({ email });

    // Keep SAME auth logic (do not break existing users)
    if (!user || user.password !== password) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Extended response for new architecture (roles, dept, branch)
    return NextResponse.json({
      message: "Login successful",
      userId: user._id,
      role: user.role,
      name: user.name,
      email: user.email,
      department: user.department || "",
      branch: user.branch || "",
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return NextResponse.json(
      { message: "Login failed" },
      { status: 500 }
    );
  }
}
