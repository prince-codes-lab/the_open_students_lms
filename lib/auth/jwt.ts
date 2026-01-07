import { jwtVerify, SignJWT } from "jose"

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not configured. Please set the JWT_SECRET environment variable.")
}

const secret = new TextEncoder().encode(JWT_SECRET)

export async function createJWT(payload: Record<string, any>) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret)
}

export async function verifyJWT(token: string) {
  try {
    const verified = await jwtVerify(token, secret)
    return verified.payload
  } catch (error) {
    console.error("[open] JWT verification failed")
    return null
  }
}
