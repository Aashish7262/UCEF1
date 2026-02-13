import { NextResponse } from "next/server";
import {connectDB }from "@/lib/db";
import Invitation from "@/models/Invitation";
import mongoose from "mongoose";

export async function PATCH(
  req: Request,
  context: { params: { id: string } }
) {
  try {
    await connectDB();

    const { id } = await context.params;;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid invitation ID" },
        { status: 400 }
      );
    }

    const invitation = await Invitation.findById(id);

    if (!invitation || invitation.status !== "pending") {
      return NextResponse.json(
        { message: "Invitation not valid" },
        { status: 400 }
      );
    }

    invitation.status = "rejected";
    await invitation.save();

    return NextResponse.json({
      message: "Invitation rejected",
    });

  } catch (error: any) {
    console.error("REJECT INVITE ERROR:", error);
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}
