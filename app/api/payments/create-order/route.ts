import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { connectDB } from "@/lib/db";
import Hackathon from "@/models/Hackathon";
import Team from "@/models/Team";
import Payment from "@/models/Payment";
import mongoose from "mongoose";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: Request) {
  try {
    await connectDB();

    const { hackathonId, userId } = await req.json();

    if (
      !mongoose.Types.ObjectId.isValid(hackathonId) ||
      !mongoose.Types.ObjectId.isValid(userId)
    ) {
      return NextResponse.json(
        { message: "Invalid IDs" },
        { status: 400 }
      );
    }

    // 1️⃣ Find Hackathon
    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      return NextResponse.json(
        { message: "Hackathon not found" },
        { status: 404 }
      );
    }

    if (!hackathon.paymentRequired) {
      return NextResponse.json(
        { message: "This hackathon is free" },
        { status: 400 }
      );
    }

    // 2️⃣ Find Team where user is leader
    const team = await Team.findOne({
      hackathon: hackathonId,
      leader: userId,
    });

    if (!team) {
      return NextResponse.json(
        { message: "Only team leader can pay" },
        { status: 403 }
      );
    }

    // 3️⃣ Check if already paid
    const existingPayment = await Payment.findOne({
      hackathon: hackathonId,
      team: team._id,
      status: "paid",
    });

    if (existingPayment) {
      return NextResponse.json(
        { message: "Payment already completed" },
        { status: 400 }
      );
    }

    // 4️⃣ Create Razorpay Order
    const options = {
      amount: hackathon.entryFee * 100, // INR to paisa
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    // 5️⃣ Save Payment Record (created state)
    await Payment.create({
      hackathon: hackathonId,
      team: team._id,
      user: userId,
      amount: hackathon.entryFee,
      razorpayOrderId: order.id,
      status: "pending",
    });

    return NextResponse.json({
      orderId: order.id,
      amount: options.amount,
      currency: "INR",
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error: any) {
    console.error("CREATE ORDER ERROR:", error);
    return NextResponse.json(
      { message: "Failed to create payment order" },
      { status: 500 }
    );
  }
}
