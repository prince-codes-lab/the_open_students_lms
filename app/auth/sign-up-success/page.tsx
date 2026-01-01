import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 bg-white">
      <div className="w-full max-w-md animate-scale-in">
        <Card className="border-2 border-[#FEEB00] shadow-2xl">
          <CardHeader className="space-y-2 text-center">
            <div className="mx-auto w-16 h-16 bg-[#FEEB00] rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-[#4E0942]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <CardTitle className="text-3xl font-bold text-[#4E0942]">Check Your Email</CardTitle>
            <CardDescription className="text-base">We&apos;ve sent you a confirmation link</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-center text-muted-foreground">
              Please check your email and click the confirmation link to activate your account. Once confirmed, you can
              sign in and start learning.
            </p>
            <Button asChild className="w-full bg-[#4E0942] hover:bg-[#4E0942]/90 text-white font-semibold">
              <Link href="/auth/login">Go to Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
