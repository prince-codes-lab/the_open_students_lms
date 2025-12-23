import { NextResponse } from "next/server"
import { connectDB2WithRetry } from "@/lib/mongodb/connection"
import { FounderSchema } from "@/lib/mongodb/models/Founder"

let cachedFounder: any | null = null

export async function GET() {
  try {
    const mongoUri = process.env.MONGODB_URI_2
    if (!mongoUri) {
      return NextResponse.json(cachedFounder || {}, { status: 200 })
    }

    const conn = await connectDB2WithRetry(mongoUri)
    if (!conn) {
      return NextResponse.json(cachedFounder || {}, { status: 200 })
    }
    const FounderModel = conn.models.Founder || conn.model("Founder", FounderSchema)
    const founder = await FounderModel.findOne()

    cachedFounder = founder || cachedFounder
    return NextResponse.json(founder || {})
  } catch (error) {
    console.error("[open] Founder fetch error:", error)
    return NextResponse.json(cachedFounder || {}, { status: 200 })
  }
}

export async function POST(request: Request) {
  try {
    const mongoUri = process.env.MONGODB_URI_2
    const body = await request.json()

    if (!mongoUri) {
      cachedFounder = { ...(cachedFounder || {}), ...body }
      return NextResponse.json(cachedFounder, { status: 200 })
    }

    const conn = await connectDB2WithRetry(mongoUri)
    if (!conn) {
      cachedFounder = { ...(cachedFounder || {}), ...body }
      return NextResponse.json(cachedFounder, { status: 200 })
    }

    const FounderModel = conn.models.Founder || conn.model("Founder", FounderSchema)
    let founder = await FounderModel.findOne()
    if (!founder) {
      founder = new FounderModel(body)
    } else {
      Object.assign(founder, body)
    }

    await founder.save()
    cachedFounder = founder
    return NextResponse.json(founder)
  } catch (error) {
    console.error("[open] Founder save error:", error)
    try {
      const body = await request.json()
      cachedFounder = { ...(cachedFounder || {}), ...body }
      return NextResponse.json(cachedFounder, { status: 200 })
    } catch {
      return NextResponse.json({ error: "Failed to save founder info" }, { status: 500 })
    }
  }
}
