import mongoose from "mongoose"

const EnrollmentSchema = new mongoose.Schema(
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
    tourId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tour",
    },
    paymentReference: {
      type: String,
      required: true,
      unique: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    amountPaid: Number,
    currency: {
      type: String,
      enum: ["NGN", "USD"],
    },
    enrollmentType: {
      type: String,
      enum: ["course", "tour", "combo"],
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    completedAt: Date,
    certificateSent: {
      type: Boolean,
      default: false,
    },
    certificateSentAt: Date,
  },
  {
    timestamps: true,
  },
)

// Virtual getters
EnrollmentSchema.virtual("user_id").get(function (this: any) {
  return this.userId?.toString() ?? this.user_id
})
EnrollmentSchema.virtual("course_id").get(function (this: any) {
  return this.courseId?.toString() ?? this.course_id?.toString()
})
EnrollmentSchema.virtual("tour_id").get(function (this: any) {
  return this.tourId?.toString() ?? this.tour_id?.toString()
})
EnrollmentSchema.virtual("payment_reference").get(function (this: any) {
  return this.paymentReference ?? this.payment_reference
})
EnrollmentSchema.virtual("payment_status").get(function (this: any) {
  return this.paymentStatus ?? this.payment_status
})
EnrollmentSchema.virtual("amount_paid").get(function (this: any) {
  return this.amountPaid ?? this.amount_paid
})
EnrollmentSchema.virtual("enrollment_type").get(function (this: any) {
  return this.enrollmentType ?? this.enrollment_type
})
EnrollmentSchema.virtual("completed_at").get(function (this: any) {
  return this.completedAt ?? this.completed_at
})
EnrollmentSchema.virtual("certificate_sent").get(function (this: any) {
  return this.certificateSent ?? this.certificate_sent
})
EnrollmentSchema.virtual("certificate_sent_at").get(function (this: any) {
  return this.certificateSentAt ?? this.certificate_sent_at
})

EnrollmentSchema.set("toJSON", { virtuals: true })
EnrollmentSchema.set("toObject", { virtuals: true })

export const Enrollment = mongoose.models.Enrollment || mongoose.model("Enrollment", EnrollmentSchema)
