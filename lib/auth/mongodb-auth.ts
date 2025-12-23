import { User } from "@/lib/mongodb/models/User"
import { Admin } from "@/lib/mongodb/models/Admin"
import { connectDB, connectDB2 } from "@/lib/mongodb/connection"

export async function authenticateUser(email: string, password: string) {
  try {
    const mongoUri = process.env.MONGODB_URI
    if (!mongoUri) throw new Error("MONGODB_URI not configured")

    await connectDB(mongoUri)

    const user = await User.findOne({ email })
    if (!user) {
      return { success: false, error: "User not found" }
    }

    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      return { success: false, error: "Invalid password" }
    }

    return {
      success: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    }
  } catch (error) {
    console.error("[open] User authentication error:", error)
    return { success: false, error: "Authentication failed" }
  }
}

export async function authenticateAdmin(email: string, password: string) {
  try {
    const mongoUri = process.env.MONGODB_URI_2 || process.env.MONGODB_URI
    if (!mongoUri) throw new Error("MONGODB_URI_2 or MONGODB_URI not configured")

    await connectDB2(mongoUri)

    const admin = await Admin.findOne({ email })
    if (!admin) {
      return { success: false, error: "Admin not found" }
    }

    const isPasswordValid = await admin.comparePassword(password)
    if (!isPasswordValid) {
      return { success: false, error: "Invalid password" }
    }

    return {
      success: true,
      admin: {
        id: admin._id.toString(),
        email: admin.email,
        fullName: admin.fullName,
        role: admin.role,
      },
    }
  } catch (error) {
    console.error("[open] Admin authentication error:", error)
    return { success: false, error: "Authentication failed" }
  }
}

export async function createUser(email: string, password: string, fullName: string) {
  try {
    const mongoUri = process.env.MONGODB_URI
    if (!mongoUri) throw new Error("MONGODB_URI not configured")

    await connectDB(mongoUri)

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return { success: false, error: "User already exists" }
    }

    const user = new User({
      email,
      password,
      fullName,
      role: "student",
    })

    await user.save()

    return {
      success: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        fullName: user.fullName,
      },
    }
  } catch (error) {
    console.error("[open] User creation error:", error)
    return { success: false, error: "Failed to create user" }
  }
}