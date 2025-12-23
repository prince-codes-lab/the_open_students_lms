import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { MapPin, Calendar, Users, Globe } from "lucide-react"
import { format } from "date-fns"
import { connectDB } from "@/lib/mongodb/connection"
import { Tour } from "@/lib/mongodb/models/Tour"
import { formatMongoData } from "@/lib/mongodb/helpers"

export const dynamic = "force-dynamic"

export default async function ToursPage() {
  const mongoUri = process.env.MONGODB_URI
  if (!mongoUri) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-[#DD91D0]/5 to-[#FF2768]/5">
        <Navigation />
        <section className="pt-32 pb-16">
          <div className="container mx-auto px-4">
            <Card className="border-2 border-[#4E0942]">
              <CardHeader>
                <CardTitle className="text-[#4E0942]">Tours Unavailable</CardTitle>
                <CardDescription>Database connection is not configured. Set `MONGODB_URI` to load tours.</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/" className="text-[#4E0942] hover:text-[#FF2768] font-medium">← Back to Home</Link>
              </CardContent>
            </Card>
          </div>
        </section>
        <Footer />
      </div>
    )
  }

  await connectDB(mongoUri)

  const rawTours = await Tour.find({
    $or: [{ isActive: true }, { is_active: true }],
  })
    .sort({ date: 1 })
    .lean({ virtuals: true })

  const tours = formatMongoData(rawTours)

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#DD91D0]/5 to-[#FF2768]/5">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-[#FF2768] to-[#DD91D0]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-6 animate-fade-in-up">
            <Badge className="bg-[#FEEB00] text-[#4E0942] hover:bg-[#FEEB00]/90 text-sm font-bold px-4 py-2">
              Educational Tours 2026
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold text-white text-balance">
              Learning <span className="text-[#FEEB00]">Beyond Borders</span>
            </h1>
            <p className="text-xl text-white/90 leading-relaxed max-w-2xl mx-auto">
              Join us on transformative educational tours across Nigeria and beyond. Experience practical learning,
              networking, and real-world exposure.
            </p>
          </div>
        </div>
      </section>

      {/* Tour Overview */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-8">
            <Card className="border-2 border-[#FEEB00] shadow-xl animate-scale-in">
              <CardContent className="p-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h2 className="text-3xl font-bold text-[#4E0942]">2026 Nigerian Tour</h2>
                    <p className="text-gray-700 leading-relaxed">
                      We&apos;re taking practical learning on the road to 7 Nigerian states from January to June 2026.
                      Experience innovation hubs, cultural centers, and meet industry leaders.
                    </p>
                    <div className="flex items-center gap-2 text-[#FF2768]">
                      <Calendar size={20} />
                      <span className="font-semibold">January - June 2026</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-[#4E0942]">Tour States</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {["Lagos", "Abuja (FCT)", "Rivers", "Oyo", "Enugu", "Kano", "Plateau"].map((state) => (
                        <div key={state} className="flex items-center gap-2 text-gray-700">
                          <MapPin size={16} className="text-[#FF2768]" />
                          <span className="text-sm">{state}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Tours List */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="text-center space-y-4 animate-fade-in-up">
              <h2 className="text-4xl font-bold text-[#4E0942]">Upcoming Tours</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-[#FF2768] to-[#FEEB00] mx-auto" />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {tours?.map((tour: any, index: number) => (
                <Card
                  key={tour.id}
                  className="border-2 hover:border-[#FF2768] transition-all hover:shadow-xl group animate-scale-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <Badge className="bg-[#4E0942] text-white hover:bg-[#4E0942]/90">{tour.state}</Badge>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-[#FF2768]">₦{tour.price_ngn.toLocaleString()}</div>
                        <div className="text-sm text-gray-600">${tour.price_usd}</div>
                      </div>
                    </div>
                    <CardTitle className="text-2xl text-[#4E0942] group-hover:text-[#FF2768] transition-colors">
                      {tour.title}
                    </CardTitle>
                    <CardDescription className="text-base">{tour.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm text-gray-700">
                        <MapPin size={18} className="text-[#FF2768]" />
                        <span>{tour.location}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-700">
                        <Calendar size={18} className="text-[#FF2768]" />
                        <span>{format(new Date(tour.date), "MMMM d, yyyy")}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-700">
                        <Users size={18} className="text-[#FF2768]" />
                        <span>
                          {tour.current_participants} / {tour.max_participants} participants
                        </span>
                      </div>
                    </div>
                    <Button asChild className="w-full bg-[#4E0942] hover:bg-[#4E0942]/90 text-white font-semibold">
                      <Link href={`/enroll?tour=${tour.id}`}>Book Your Spot</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Future Plans */}
      <section className="py-16 bg-gradient-to-br from-[#4E0942] to-[#DD91D0]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in-up">
            <div className="flex items-center justify-center gap-3">
              <Globe className="text-[#FEEB00]" size={40} />
              <h2 className="text-4xl font-bold text-white">Going Global</h2>
            </div>
            <p className="text-xl text-white/90 leading-relaxed">
              After our Nigerian tour, we&apos;re expanding to Ghana, Cameroon, Benin Republic, Côte d&apos;Ivoire, and the
              Philippines. Be the first to know when we announce dates!
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {["Ghana", "Cameroon", "Benin Republic", "Côte d&apos;Ivoire", "Philippines"].map((country) => (
                <Badge
                  key={country}
                  className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm text-base px-4 py-2"
                >
                  {country}
                </Badge>
              ))}
            </div>
            <Button
              asChild
              size="lg"
              className="bg-[#FEEB00] hover:bg-[#FEEB00]/90 text-[#4E0942] font-bold text-lg px-8 py-6"
            >
              <Link href="/community">Get Updates</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* What to Expect */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="text-center space-y-4 animate-fade-in-up">
              <h2 className="text-4xl font-bold text-[#4E0942]">What to Expect</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-[#FF2768] to-[#FEEB00] mx-auto" />
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  title: "Site Visits",
                  description: "Visit innovation hubs, startups, cultural centers, and industry-leading organizations",
                  color: "#FF2768",
                },
                {
                  title: "Networking",
                  description: "Meet entrepreneurs, industry leaders, and like-minded peers from across the region",
                  color: "#4E0942",
                },
                {
                  title: "Workshops",
                  description: "Participate in hands-on workshops and seminars led by experts in various fields",
                  color: "#DD91D0",
                },
              ].map((item, index) => (
                <Card
                  key={item.title}
                  className="border-2 hover:border-[#FF2768] transition-all hover:shadow-xl animate-scale-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardContent className="p-6 space-y-4">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${item.color}20` }}
                    >
                      <div className="w-6 h-6 rounded-full" style={{ backgroundColor: item.color }} />
                    </div>
                    <h3 className="text-xl font-bold text-[#4E0942]">{item.title}</h3>
                    <p className="text-gray-700 leading-relaxed">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
