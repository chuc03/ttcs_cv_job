import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    cv: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CV",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "reviewed", "accepted", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

const Application = mongoose.model(
  "Application",
  applicationSchema,
  "applications"
);
export default Application;
