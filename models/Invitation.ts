import mongoose, { Schema, models } from "mongoose";

const InvitationSchema = new Schema(
  {
    hackathon: {
      type: Schema.Types.ObjectId,
      ref: "Hackathon",
      required: true,
    },

    team: {
      type: Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },

    from: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    to: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default models.Invitation ||
  mongoose.model("Invitation", InvitationSchema);
