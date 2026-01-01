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

    // Check if email is verified
    if (!user.emailVerified) {
      return { success: false, error: "Please verify your email before logging in", emailNotVerified: true }
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
        emailVerified: user.emailVerified,
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

    // Generate verification token
    const verificationToken = require("crypto").randomBytes(32).toString("hex")
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    const user = new User({
      email,
      password,
      fullName,
      role: "student",
      emailVerified: false,
      verificationToken,
      verificationTokenExpiry,
    })

    await user.save()

    return {
      success: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        fullName: user.fullName,
        emailVerified: user.emailVerified,
        verificationToken: verificationToken,
      },
    }
  } catch (error) {
    console.error("[open] User creation error:", error)
    return { success: false, error: "Failed to create user" }
  }
}

export async function verifyEmail(email: string, verificationToken: string) {
  try {
    const mongoUri = process.env.MONGODB_URI
    if (!mongoUri) throw new Error("MONGODB_URI not configured")

    await connectDB(mongoUri)

    const user = await User.findOne({ email })
    if (!user) {
      return { success: false, error: "User not found" }
    }

    // Check if token matches and hasn't expired
    if (user.verificationToken !== verificationToken) {
      return { success: false, error: "Invalid verification token" }
    }

    if (!user.verificationTokenExpiry || user.verificationTokenExpiry < new Date()) {
      return { success: false, error: "Verification token has expired" }
    }

    // Mark email as verified
    user.emailVerified = true
    user.verificationToken = undefined
    user.verificationTokenExpiry = undefined
    await user.save()

    return {
      success: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        fullName: user.fullName,
        emailVerified: user.emailVerified,
      },
    }
  } catch (error) {
    console.error("[open] Email verification error:", error)
    return { success: false, error: "Email verification failed" }
  }
}
