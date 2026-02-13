import mongoose, { Schema, models } from "mongoose";

const TeamSchema = new Schema(
  {
    hackathon: {
      type: Schema.Types.ObjectId,
      ref: "Hackathon",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    leader: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    members: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    status: {
      type: String,
      enum: ["active", "locked"],
      default: "active",
    },
  },
  { timestamps: true }
);

export default models.Team ||
  mongoose.model("Team", TeamSchema);
