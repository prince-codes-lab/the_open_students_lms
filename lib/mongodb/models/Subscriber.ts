import mongoose from "mongoose"

const SubscriberSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, index: true },
    location: String,
  },
  { timestamps: true },
)

export const Subscriber = mongoose.models.Subscriber || mongoose.model("Subscriber", SubscriberSchema)
