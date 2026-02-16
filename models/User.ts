import mongoose, { Schema, models } from "mongoose";

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      unique: true,
      required: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["admin", "student"],
      default: "student",
    },

    // NEW (from your diagram)
    department: {
      type: String,
      required: false,
    },

    branch: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

export const User = models.User || mongoose.model("User", UserSchema);


