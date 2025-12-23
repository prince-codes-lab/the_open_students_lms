import mongoose from "mongoose"

const TripUpdateSchema = new mongoose.Schema({
  title: String,
  description: String,
  imageUrl: String,
  imageName: String,
  date: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

const TripPlanningSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    state: String,
    location: String,
    updates: [TripUpdateSchema],
  },
  {
    timestamps: true,
  },
)

export const TripPlanning = mongoose.models.TripPlanning || mongoose.model("TripPlanning", TripPlanningSchema)
