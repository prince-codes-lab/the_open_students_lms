import mongoose from "mongoose"

const TourSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: String,
    location: String,
    state: String,
    date: Date,
    priceNgn: Number,
    priceUsd: Number,
    maxParticipants: Number,
    currentParticipants: {
      type: Number,
      default: 0,
    },
    thumbnailUrl: String,
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
)

// Virtual getters for backward compatibility
TourSchema.virtual("price_ngn").get(function (this: any) {
  return this.priceNgn ?? this.price_ngn
})
TourSchema.virtual("price_usd").get(function (this: any) {
  return this.priceUsd ?? this.price_usd
})
TourSchema.virtual("max_participants").get(function (this: any) {
  return this.maxParticipants ?? this.max_participants
})
TourSchema.virtual("current_participants").get(function (this: any) {
  return this.currentParticipants ?? this.current_participants
})
TourSchema.virtual("is_active").get(function (this: any) {
  return this.isActive ?? this.is_active
})

TourSchema.set("toJSON", { virtuals: true })
TourSchema.set("toObject", { virtuals: true })

export const Tour = mongoose.models.Tour || mongoose.model("Tour", TourSchema)
