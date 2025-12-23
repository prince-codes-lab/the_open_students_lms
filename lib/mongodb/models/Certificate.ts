import mongoose from "mongoose"

const CertificateSchema = new mongoose.Schema(
  {
    enrollmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Enrollment",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    certificateNumber: {
      type: String,
      unique: true,
    },
    certificateUrl: String,
    issuedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
)

CertificateSchema.virtual("certificate_number").get(function (this: any) {
  return this.certificateNumber ?? this.certificate_number
})
CertificateSchema.virtual("certificate_url").get(function (this: any) {
  return this.certificateUrl ?? this.certificate_url
})
CertificateSchema.virtual("user_id").get(function (this: any) {
  return this.userId?.toString() ?? this.user_id
})
CertificateSchema.virtual("enrollment_id").get(function (this: any) {
  return this.enrollmentId?.toString() ?? this.enrollment_id?.toString()
})
CertificateSchema.virtual("issued_at").get(function (this: any) {
  return this.issuedAt ?? this.issued_at
})

CertificateSchema.set("toJSON", { virtuals: true })
CertificateSchema.set("toObject", { virtuals: true })

export const Certificate = mongoose.models.Certificate || mongoose.model("Certificate", CertificateSchema)
