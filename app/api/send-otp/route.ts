import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { saveOtp } from "@/lib/otpStore";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { message: "Email required" },
        { status: 400 }
      );
    }

   
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    
    saveOtp(email, otp);

  
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

   
    await transporter.sendMail({
      from: `"HackathonHub" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your OTP for HackathonHub",
      html: `
        <div style="font-family: Arial, sans-serif">
          <h2>Email Verification</h2>
          <p>Your OTP is:</p>
          <h1 style="letter-spacing: 4px">${otp}</h1>
          <p>This OTP is valid for 5 minutes.</p>
        </div>
      `,
    });

    return NextResponse.json({
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("SEND OTP ERROR:", error);
    return NextResponse.json(
      { message: "Failed to send OTP" },
      { status: 500 }
    );
  }
}


