"use client"

import { signIn, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { 
  TrendingUp, 
  BarChart3, 
  Bell, 
  Shield, 
  ChevronRight,
  Loader2,
  PieChart
} from "lucide-react"
import { Button } from "@/components/ui/button"

const features = [
  {
    icon: TrendingUp,
    title: "Live Portfolio Tracking",
    description: "Real-time DSE market prices synced automatically",
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description: "Sector allocation, P&L charts, and performance metrics",
  },
  {
    icon: Bell,
    title: "Smart Price Alerts",
    description: "Get notified when your target prices are hit",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "Your portfolio data is encrypted and only visible to you",
  },
]

export default function LoginPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isSigningIn, setIsSigningIn] = useState(false)

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/")
    }
  }, [status, router])

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true)
    try {
      await signIn("google", { callbackUrl: "/" })
    } catch {
      setIsSigningIn(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background overflow-hidden">
      {/* Left Panel – Branding */}
      <div className="relative hidden lg:flex lg:w-[55%] flex-col justify-between p-12 overflow-hidden bg-gradient-to-br from-[#0a1628] via-[#0d2340] to-[#061020]">
        {/* Decorative glowing orbs */}
        <div className="absolute top-[-10%] left-[-5%] w-96 h-96 rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-5%] w-80 h-80 rounded-full bg-blue-500/15 blur-[100px] pointer-events-none" />
        <div className="absolute top-[40%] right-[10%] w-64 h-64 rounded-full bg-primary/10 blur-[80px] pointer-events-none" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/30">
            <PieChart className="h-6 w-6" />
          </div>
          <span className="text-2xl font-bold text-white tracking-tight">DSE Portfolio</span>
        </div>

        {/* Hero text */}
        <div className="relative z-10 space-y-6">
          <div>
            <h1 className="text-5xl font-extrabold text-white leading-tight tracking-tight">
              Track your DSE
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400">
                portfolio smarter
              </span>
            </h1>
            <p className="mt-4 text-lg text-slate-400 leading-relaxed max-w-md">
              Real-time prices, advanced analytics, and intelligent alerts — all in one beautiful dashboard built for Dhaka Stock Exchange investors.
            </p>
          </div>

          {/* Features list */}
          <div className="grid grid-cols-1 gap-4">
            {features.map((f) => (
              <div key={f.title} className="flex items-start gap-4 group">
                <div className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 border border-white/10 group-hover:border-primary/40 group-hover:bg-primary/10 transition-all duration-200">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{f.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{f.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom testimonial */}
        <div className="relative z-10">
          <div className="flex items-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className="h-4 w-4 fill-amber-400 text-amber-400" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <p className="text-sm text-slate-300 italic">&ldquo;Best portfolio tracker for the DSE market. Clean, fast, and reliable.&rdquo;</p>
          <p className="text-xs text-slate-500 mt-1">— DSE Investor Community</p>
        </div>
      </div>

      {/* Right Panel – Sign In Form */}
      <div className="flex flex-1 items-center justify-center p-6 sm:p-12 lg:p-16">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-md">
              <PieChart className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight">DSE Portfolio</span>
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Welcome back</h2>
            <p className="text-muted-foreground">
              Sign in to access your portfolio dashboard and start tracking.
            </p>
          </div>

          {/* Google Sign In Button */}
          <div className="space-y-4">
            <Button
              id="google-signin-btn"
              size="lg"
              variant="outline"
              className="w-full h-14 text-base font-semibold border-2 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 gap-3 shadow-sm"
              onClick={handleGoogleSignIn}
              disabled={isSigningIn}
            >
              {isSigningIn ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <svg className="h-5 w-5 flex-shrink-0" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
              )}
              {isSigningIn ? "Signing in..." : "Continue with Google"}
              {!isSigningIn && <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto" />}
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Secure authentication</span>
              </div>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Shield, label: "SSL Encrypted" },
                { icon: () => (
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                ), label: "No Password" },
                { icon: () => (
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                ), label: "Google OAuth" },
              ].map((badge) => (
                <div
                  key={badge.label}
                  className="flex flex-col items-center justify-center gap-1.5 rounded-lg border border-border bg-card p-3 text-center"
                >
                  <badge.icon className="h-4 w-4 text-primary" />
                  <span className="text-[10px] font-medium text-muted-foreground leading-tight">{badge.label}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground leading-relaxed">
            By signing in, you agree to our{" "}
            <span className="underline underline-offset-2 cursor-pointer hover:text-foreground transition-colors">
              Terms of Service
            </span>{" "}
            and{" "}
            <span className="underline underline-offset-2 cursor-pointer hover:text-foreground transition-colors">
              Privacy Policy
            </span>
            .
          </p>
        </div>
      </div>
    </div>
  )
}
