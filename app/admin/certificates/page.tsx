import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AdminGuard } from "@/components/admin-guard"
import { Award, Download, Calendar, User } from "lucide-react"
import { connectDB } from "@/lib/mongodb/connection"
import { Certificate } from "@/lib/mongodb/models/Certificate"
import { Profile } from "@/lib/mongodb/models/Profile"
import { formatMongoData } from "@/lib/mongodb/helpers"

export const dynamic = "force-dynamic"

export default async function AdminCertificatesPage() {
  const mongoUri = process.env.MONGODB_URI
  if (!mongoUri) {
    return (
      <AdminGuard>
        <div className="min-h-screen bg-white">
          <div className="container mx-auto px-4 py-8">
            <Card className="border-2 border-[#4E0942]">
              <CardHeader>
                <CardTitle className="text-[#4E0942]">Certificates Unavailable</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Database connection is not configured. Set `MONGODB_URI` to view certificates.</p>
                <Link href="/admin" className="text-[#4E0942] hover:text-[#FF2768] font-medium">
                  ← Back to Admin Dashboard
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </AdminGuard>
    )
  }

  await connectDB(mongoUri)

  const certificateDocs = await Certificate.find()
    .populate({
      path: "enrollmentId",
      populate: [{ path: "courseId" }, { path: "tourId" }, { path: "userId" }],
    })
    .sort({ issuedAt: -1 })
    .lean({ virtuals: true })

  const userIds = Array.from(new Set(certificateDocs.map((doc) => doc.user_id).filter(Boolean)))
  const profileDocs = await Profile.find({ userId: { $in: userIds } }).lean({ virtuals: true })
  const profileMap = new Map(profileDocs.map((profile) => [profile.user_id, formatMongoData(profile)]))

  const certificates = certificateDocs.map((doc: any) => {
    const enrollment = doc.enrollmentId ? formatMongoData(doc.enrollmentId) : null
    const course = doc.enrollmentId?.courseId ? formatMongoData(doc.enrollmentId.courseId) : null
    const tour = doc.enrollmentId?.tourId ? formatMongoData(doc.enrollmentId.tourId) : null
    const profile = profileMap.get(doc.user_id)
    const user = doc.enrollmentId?.userId

    const studentName =
      profile?.full_name || profile?.fullName || user?.fullName || profile?.email || user?.email || "Unknown Student"

    return {
      ...formatMongoData(doc),
      studentName,
      programName: course?.title || tour?.title || "Unknown Program",
      studentEmail: profile?.email || user?.email,
    }
  })

  return (
    <AdminGuard>
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-[#4E0942] mb-2">Certificates</h1>
            <p className="text-gray-600">View all issued certificates</p>
          </div>

          <Card className="border-2 border-[#FEEB00]">
            <CardHeader>
              <CardTitle className="text-[#4E0942] flex items-center gap-2">
                <Award size={24} />
                All Certificates ({certificates.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {certificates.map((cert) => (
                  <Card key={cert.id} className="border-2 border-[#FEEB00] hover:shadow-xl transition-all">
                    <CardContent className="p-6 space-y-4">
                      <div className="w-16 h-16 bg-[#FEEB00] rounded-full flex items-center justify-center mx-auto">
                        <Award size={32} className="text-[#4E0942]" />
                      </div>
                      <div className="text-center space-y-2">
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                          <User size={14} />
                          <span>{cert.studentName}</span>
                        </div>
                        <h3 className="font-bold text-[#4E0942]">{cert.programName}</h3>
                        <Badge className="bg-[#4E0942] text-white">#{cert.certificate_number}</Badge>
                        <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                          <Calendar size={12} />
                          <span>
                            {cert.issued_at
                              ? new Date(cert.issued_at).toLocaleDateString()
                              : cert.issuedAt
                                ? new Date(cert.issuedAt).toLocaleDateString()
                                : "Date unavailable"}
                          </span>
                        </div>
                      </div>
                      {cert.certificate_url && (
                        <Button
                          asChild
                          variant="outline"
                          className="w-full border-2 border-[#4E0942] text-[#4E0942] bg-transparent"
                        >
                          <a href={cert.certificate_url} download>
                            <Download size={16} className="mr-2" />
                            Download
                          </a>
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
                {certificates.length === 0 && (
                  <div className="col-span-full text-center text-gray-500 py-12">No certificates issued yet</div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="mt-8">
            <Link href="/admin" className="text-[#4E0942] hover:text-[#FF2768] font-medium flex items-center gap-2">
              ← Back to Admin Dashboard
            </Link>
          </div>
        </div>
      </div>
    </AdminGuard>
  )
}
