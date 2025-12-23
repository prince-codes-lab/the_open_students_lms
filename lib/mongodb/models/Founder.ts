import mongoose from "mongoose"

export const FounderSchema = new mongoose.Schema(
  {
    name: String,
    title: String,
    bio: String,
    imageUrl: String,
    imageName: String,
  },
  {
    timestamps: true,
  },
)

export const Founder = mongoose.models.Founder || mongoose.model("Founder", FounderSchema)
