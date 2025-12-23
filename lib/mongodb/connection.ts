import mongoose from "mongoose"

let isConnected = false
let isConnected2 = false
let connection2: mongoose.Connection | null = null

export async function connectDB(mongoUri: string) {
  if (isConnected) {
    console.log("[open] Using existing database connection")
    return mongoose.connection
  }

  if (!mongoUri) {
    throw new Error("MongoDB URI is not defined. Please add MONGODB_URI to your environment variables.")
  }

  try {
    await mongoose.connect(mongoUri)
    isConnected = true
    console.log("[open] MongoDB connected successfully")
    return mongoose.connection
  } catch (error) {
    console.error("[open] MongoDB connection failed:", error)
    throw error
  }
}

export async function connectDB2(mongoUri: string) {
  if (isConnected2 && connection2) {
    console.log("[open] Using existing secondary database connection")
    return connection2
  }

  if (!mongoUri) {
    throw new Error("MongoDB URI 2 is not defined. Please add MONGODB_URI_2 to your environment variables.")
  }

  try {
    connection2 = await mongoose.createConnection(mongoUri)
    isConnected2 = true
    console.log("[open] MongoDB 2 connected successfully")
    return connection2
  } catch (error) {
    console.error("[open] MongoDB 2 connection failed:", error)
    throw error
  }
}

export async function connectDBWithRetry(mongoUri: string, attempts = 3, baseDelayMs = 300) {
  let lastError: unknown = null
  for (let i = 0; i < Math.max(1, attempts); i++) {
    try {
      const conn = await connectDB(mongoUri)
      return conn
    } catch (err) {
      lastError = err
      const delay = baseDelayMs * Math.pow(2, i)
      await new Promise((r) => setTimeout(r, delay))
    }
  }
  return null
}

export async function connectDB2WithRetry(mongoUri: string, attempts = 3, baseDelayMs = 300) {
  let lastError: unknown = null
  for (let i = 0; i < Math.max(1, attempts); i++) {
    try {
      const conn = await connectDB2(mongoUri)
      return conn
    } catch (err) {
      lastError = err
      const delay = baseDelayMs * Math.pow(2, i)
      await new Promise((r) => setTimeout(r, delay))
    }
  }
  return null
}
