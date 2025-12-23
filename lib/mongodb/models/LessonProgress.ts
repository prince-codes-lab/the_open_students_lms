import mongoose from "mongoose"

const LessonProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ModuleLesson",
    },
    completed: {
      type: Boolean,
      default: false,
    },
    completedAt: Date,
  },
  {
    timestamps: true,
  },
)

// Virtual getters
LessonProgressSchema.virtual("user_id").get(function (this: any) {
  return this.userId?.toString() ?? this.user_id
})
LessonProgressSchema.virtual("course_id").get(function (this: any) {
  return this.courseId?.toString() ?? this.course_id?.toString()
})
LessonProgressSchema.virtual("lesson_id").get(function (this: any) {
  return this.lessonId?.toString() ?? this.lesson_id?.toString()
})
LessonProgressSchema.virtual("completed_at").get(function (this: any) {
  return this.completedAt ?? this.completed_at
})

LessonProgressSchema.set("toJSON", { virtuals: true })
LessonProgressSchema.set("toObject", { virtuals: true })

export const LessonProgress = mongoose.models.LessonProgress || mongoose.model("LessonProgress", LessonProgressSchema)
