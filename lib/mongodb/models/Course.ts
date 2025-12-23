import mongoose from "mongoose"

const CourseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ["writing", "graphics", "video", "speaking", "leadership", "storytelling"],
    },
    priceNgn: Number,
    priceUsd: Number,
    durationWeeks: Number,
    thumbnailUrl: String,
    googleClassroomLink: String,
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
CourseSchema.virtual("price_ngn").get(function (this: any) {
  return this.priceNgn ?? this.price_ngn
})
CourseSchema.virtual("price_usd").get(function (this: any) {
  return this.priceUsd ?? this.price_usd
})
CourseSchema.virtual("duration_weeks").get(function (this: any) {
  return this.durationWeeks ?? this.duration_weeks
})
CourseSchema.virtual("google_classroom_link").get(function (this: any) {
  return this.googleClassroomLink ?? this.google_classroom_link
})
CourseSchema.virtual("is_active").get(function (this: any) {
  return this.isActive ?? this.is_active
})

CourseSchema.set("toJSON", { virtuals: true })
CourseSchema.set("toObject", { virtuals: true })

export const Course = mongoose.models.Course || mongoose.model("Course", CourseSchema)
