import mongoose, { Schema, models } from "mongoose";

const EventRulesSchema = new Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      unique: true,
    },

    rules: [
      {
        text: {
          type: String,
          required: true,
        },
        order: {
          type: Number,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);


export const EventRules =
  models.EventRules || mongoose.model("EventRules", EventRulesSchema);
