import { verifyJWT } from "@/lib/auth/jwt"
import { cookies } from "next/headers"

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies()
    const authToken = cookieStore.get("auth_token")?.value

    if (!authToken) {
      return null
    }

    const payload = await verifyJWT(authToken)
    if (!payload || !payload.userId) {
      return null
    }

    return {
      id: payload.userId as string,
      email: payload.email as string,
      role: payload.role as string,
    }
  } catch (error) {
    console.error("[open] Error getting current user:", error)
    return null
  }
}

export function formatMongoData(data: any): any {
  if (!data) return null

  if (Array.isArray(data)) {
    return data.map(formatMongoData)
  }

  if (data.toObject) {
    const obj = data.toObject()
    // Convert _id to id
    if (obj._id) {
      obj.id = obj._id.toString()
      delete obj._id
    }
    return obj
  }

  if (data._id) {
    const obj = { ...data }
    obj.id = obj._id.toString()
    delete obj._id
    return obj
  }

  return data
}