import mongoose from "mongoose"

const CourseModuleSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: String,
    orderIndex: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
)

// Virtual getters
CourseModuleSchema.virtual("course_id").get(function (this: any) {
  return this.courseId?.toString() ?? this.course_id?.toString()
})
CourseModuleSchema.virtual("order_index").get(function (this: any) {
  return this.orderIndex ?? this.order_index
})

CourseModuleSchema.set("toJSON", { virtuals: true })
CourseModuleSchema.set("toObject", { virtuals: true })

export const CourseModule = mongoose.models.CourseModule || mongoose.model("CourseModule", CourseModuleSchema)
