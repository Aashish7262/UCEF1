import mongoose, { Schema, models } from "mongoose";

const EventSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    eventDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["draft", "live", "completed"],
      default: "draft",
    },

    // Admin = Organizer (CRITICAL CHANGE)
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // QR control (for 2 min before end logic)
    qrEnabled: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Event = models.Event || mongoose.model("Event", EventSchema);


