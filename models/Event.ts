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
      enum: ["draft", "live"],
      default: "draft",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);


EventSchema.virtual("isExpired").get(function () {
  if (!this.endDate) return false;
  return new Date() > this.endDate;
});

export const Event = models.Event || mongoose.model("Event", EventSchema);

