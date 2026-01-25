import { NextResponse } from "next/server";
import { verifyOtp, deleteOtp } from "@/lib/otpStore";

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json(
        { message: "Email and OTP required" },
        { status: 400 }
      );
    }

    const isValid = verifyOtp(email, otp);

    if (!isValid) {
      return NextResponse.json(
        { message: "Invalid OTP" },
        { status: 401 }
      );
    }

    
    deleteOtp(email);

    return NextResponse.json(
      { message: "OTP verified successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "OTP verification failed" },
      { status: 500 }
    );
  }
}
