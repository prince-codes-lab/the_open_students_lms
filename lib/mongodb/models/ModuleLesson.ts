import mongoose from "mongoose"

const ModuleLessonSchema = new mongoose.Schema(
  {
    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CourseModule",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: String,
    contentType: {
      type: String,
      enum: ["video", "text", "quiz", "assignment"],
      default: "text",
    },
    content: String,
    durationMinutes: Number,
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
ModuleLessonSchema.virtual("module_id").get(function (this: any) {
  return this.moduleId?.toString() ?? this.module_id?.toString()
})
ModuleLessonSchema.virtual("content_type").get(function (this: any) {
  return this.contentType ?? this.content_type
})
ModuleLessonSchema.virtual("duration_minutes").get(function (this: any) {
  return this.durationMinutes ?? this.duration_minutes
})
ModuleLessonSchema.virtual("order_index").get(function (this: any) {
  return this.orderIndex ?? this.order_index
})

ModuleLessonSchema.set("toJSON", { virtuals: true })
ModuleLessonSchema.set("toObject", { virtuals: true })

export const ModuleLesson = mongoose.models.ModuleLesson || mongoose.model("ModuleLesson", ModuleLessonSchema)
