import mongoose from "mongoose"

const AdminSettingsSchema = new mongoose.Schema(
  {
    logoUrl: String,
    logoName: String,
    homepageSlider: [
      {
        imageUrl: String,
        caption: String,
      },
    ],
    environmentVariables: {
      NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY: String,
      PAYSTACK_SECRET_KEY: String,
      NEXT_PUBLIC_SITE_URL: String,
      JWT_SECRET: String,
      MONGODB_URI: String,
      MONGODB_URI_2: String,
    },
    siteSettings: {
      siteName: String,
      tagline: String,
      description: String,
    },
  },
  {
    timestamps: true,
  },
)

export const AdminSettings = mongoose.models.AdminSettings || mongoose.model("AdminSettings", AdminSettingsSchema)
