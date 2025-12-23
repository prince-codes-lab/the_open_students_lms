import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { redirect } from "next/navigation"
import { getCurrentUser, formatMongoData } from "@/lib/mongodb/helpers"
import { connectDBWithRetry } from "@/lib/mongodb/connection"
import { Course } from "@/lib/mongodb/models/Course"
import { Tour } from "@/lib/mongodb/models/Tour"
import { EnrollForm } from "@/components/enroll-form"
import { AdminSettings } from "@/lib/mongodb/models/AdminSettings"

export const dynamic = "force-dynamic"

type EnrollSearchParams = {
  course?: string
  tour?: string
  combo?: string
}

export default async function EnrollPage({ searchParams }: { searchParams: Promise<EnrollSearchParams> }) {
  const user = await getCurrentUser()
  const sp = await searchParams
  const params = new URLSearchParams()
  if (sp?.course && typeof sp.course === "string") {
    params.set("course", sp.course)
  }
  if (sp?.tour && typeof sp.tour === "string") {
    params.set("tour", sp.tour)
  }
  if (sp?.combo && typeof sp.combo === "string") {
    params.set("combo", sp.combo)
  }
  const searchString = params.toString()
  const redirectPath = searchString ? `/enroll?${searchString}` : "/enroll"

  if (!user) {
    redirect(`/auth/login?redirect=${encodeURIComponent(redirectPath)}`)
  }

  const mongoUri = process.env.MONGODB_URI
  let publicKeyOverride: string | undefined = undefined
  let dbReady = false
  // Pre-computed combo mapping so enroll works without DB
  const norm = (s: string) => s.toLowerCase().replace(/\s+/g, "-")
  const comboKey = sp?.combo ? norm(sp.combo) : undefined
  const comboCourse = (() => {
    switch (comboKey) {
      case "creative-combo":
        return {
          id: "combo:creative-combo",
          title: "Creative Combo",
          description: "Writing + Graphics Design + Video Editing",
          price_ngn: 12000,
          price_usd: 10,
        }
      case "communication-combo":
        return {
          id: "combo:communication-combo",
          title: "Communication Combo",
          description: "Writing + Public Speaking",
          price_ngn: 10000,
          price_usd: 8,
        }
      case "leadership-combo":
        return {
          id: "combo:leadership-combo",
          title: "Leadership Combo",
          description: "Public Speaking + Leadership & Teamwork",
          price_ngn: 10000,
          price_usd: 8,
        }
      case "full-suite":
        return {
          id: "combo:full-suite",
          title: "Full Skills Suite",
          description: "All 6 courses included",
          price_ngn: 30000,
          price_usd: 25,
        }
      default:
        return undefined
    }
  })()
  if (mongoUri) {
    const conn = await connectDBWithRetry(mongoUri)
    dbReady = !!conn
    if (conn) {
      try {
        const settings = await AdminSettings.findOne().lean()
        const pk = (settings as any)?.environmentVariables?.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY
        if (typeof pk === "string" && pk) {
          publicKeyOverride = pk
        }
      } catch {}
    }
  }
  if (!publicKeyOverride && process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY) {
    publicKeyOverride = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY
  }

  const [courseDoc, tourDoc] = dbReady
    ? await Promise.all([
        sp.course ? Course.findById(sp.course).lean({ virtuals: true }) : Promise.resolve(null),
        sp.tour ? Tour.findById(sp.tour).lean({ virtuals: true }) : Promise.resolve(null),
      ])
    : [null, null]

  const course = courseDoc ? formatMongoData(courseDoc) : comboCourse
  const tour = formatMongoData(tourDoc)

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#DD91D0]/5 to-[#FF2768]/5">
      <Navigation />
      {!dbReady ? (
        <section className="pt-32 pb-16">
          <div className="container mx-auto px-4">
            <Card className="border-2 border-[#4E0942]">
              <CardHeader>
                <CardTitle className="text-[#4E0942]">Enrollment Temporarily Unavailable</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">We’re having trouble connecting to our database. Please try again shortly.</p>
                <Link href="/programs" className="text-[#4E0942] hover:text-[#FF2768] font-medium">← Browse Programs</Link>
              </CardContent>
            </Card>
          </div>
        </section>
      ) : (
        <EnrollForm
          user={{ id: user.id, email: user.email }}
          course={course}
          tour={tour}
          publicKeyOverride={publicKeyOverride}
        />
      )}
      <Footer />
    </div>
  )
}
