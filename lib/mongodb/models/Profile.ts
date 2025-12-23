import mongoose from "mongoose"

const ProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    fullName: String,
    email: {
      type: String,
      required: true,
    },
    phone: String,
    ageRange: String,
    country: String,
  },
  {
    timestamps: true,
  },
)

// Virtual getters
ProfileSchema.virtual("user_id").get(function (this: any) {
  return this.userId?.toString() ?? this.user_id
})
ProfileSchema.virtual("full_name").get(function (this: any) {
  return this.fullName ?? this.full_name
})

ProfileSchema.set("toJSON", { virtuals: true })
ProfileSchema.set("toObject", { virtuals: true })

export const Profile = mongoose.models.Profile || mongoose.model("Profile", ProfileSchema)
