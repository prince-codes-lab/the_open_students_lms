import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb/connection"
import { TripPlanning } from "@/lib/mongodb/models/TripPlanning"

export async function GET() {
  try {
    const mongoUri = process.env.MONGODB_URI
    if (!mongoUri) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 })
    }

    await connectDB(mongoUri)
    const trips = await TripPlanning.find()

    return NextResponse.json(trips || [])
  } catch (error) {
    console.error("[open] Trips fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch trips" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const mongoUri = process.env.MONGODB_URI
    if (!mongoUri) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 })
    }

    await connectDB(mongoUri)
    const body = await request.json()

    const trip = new TripPlanning(body)
    await trip.save()

    return NextResponse.json(trip)
  } catch (error) {
    console.error("[open] Trip save error:", error)
    return NextResponse.json({ error: "Failed to save trip" }, { status: 500 })
  }
}
