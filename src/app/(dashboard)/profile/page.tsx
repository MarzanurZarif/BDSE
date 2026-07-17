"use client"

import { useSession, signOut } from "next-auth/react"
import { usePortfolio } from "@/context/portfolio-context"
import { formatCurrency } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  User,
  Mail,
  Calendar,
  Crown,
  TrendingUp,
  BarChart3,
  LogOut,
  Star,
  CheckCircle,
  ExternalLink,
  Shield,
  PieChart,
} from "lucide-react"
import Link from "next/link"
import { useMemo } from "react"
import { cn } from "@/lib/utils"

const PLAN = {
  name: "Free",
  badge: "Current Plan",
  color: "text-muted-foreground",
  bg: "bg-muted",
  features: ["Up to 10 Holdings", "Dashboard Access", "Manual Refresh", "Basic Sorting"],
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const { holdings, isLoaded } = usePortfolio()

  const stats = useMemo(() => {
    if (!holdings.length) return { totalValue: 0, totalInvested: 0, totalPL: 0, plPercent: 0 }
    const totalValue = holdings.reduce((s, h) => s + h.currentLTP * h.quantity, 0)
    const totalInvested = holdings.reduce((s, h) => s + h.boughtPrice * h.quantity, 0)
    const totalPL = totalValue - totalInvested
    const plPercent = totalInvested > 0 ? (totalPL / totalInvested) * 100 : 0
    return { totalValue, totalInvested, totalPL, plPercent }
  }, [holdings])

  const memberSince = session?.user?.email
    ? "July 2025" // Would be from DB; placeholder for now
    : "—"

  const user = session?.user

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?"

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground mt-1">Your account details and subscription overview.</p>
      </div>

      {/* Hero card */}
      <Card className="relative overflow-hidden border-primary/20">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

        <CardContent className="relative p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar */}
            {user?.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.image}
                alt={user.name ?? "Profile"}
                className="h-20 w-20 rounded-2xl ring-4 ring-primary/20 shadow-lg object-cover flex-shrink-0"
              />
            ) : (
              <div className="h-20 w-20 rounded-2xl ring-4 ring-primary/20 shadow-lg bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center text-2xl font-bold text-white flex-shrink-0">
                {status === "loading" ? (
                  <User className="h-8 w-8" />
                ) : (
                  initials
                )}
              </div>
            )}

            {/* Info */}
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-start sm:items-center flex-col sm:flex-row gap-2 sm:gap-3">
                <h2 className="text-2xl font-bold truncate">
                  {status === "loading" ? (
                    <span className="block h-7 w-48 rounded-lg bg-muted animate-pulse" />
                  ) : (
                    user?.name ?? "Anonymous User"
                  )}
                </h2>
                <span className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
                  PLAN.bg,
                  PLAN.color,
                  "border border-border"
                )}>
                  <Shield className="h-3 w-3" />
                  {PLAN.name} Plan
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Mail className="h-4 w-4 flex-shrink-0" />
                  {status === "loading" ? (
                    <span className="block h-4 w-40 rounded bg-muted animate-pulse" />
                  ) : (
                    user?.email ?? "—"
                  )}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 flex-shrink-0" />
                  Member since {memberSince}
                </span>
              </div>
            </div>

            {/* Actions */}
            <Button
              variant="outline"
              className="flex-shrink-0 gap-2 text-destructive border-destructive/30 hover:bg-destructive/10 hover:border-destructive/60"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Portfolio Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Portfolio Overview
            </CardTitle>
            <CardDescription>A quick snapshot of your investments.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoaded ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl bg-muted/40 p-4 space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Holdings</p>
                    <p className="text-2xl font-bold">{holdings.length}</p>
                  </div>
                  <div className="rounded-xl bg-muted/40 p-4 space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Value</p>
                    <p className="text-2xl font-bold text-primary">{formatCurrency(stats.totalValue)}</p>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Invested</span>
                    <span className="font-medium">{formatCurrency(stats.totalInvested)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Overall P&L</span>
                    <span className={cn("font-bold", stats.totalPL >= 0 ? "text-primary" : "text-destructive")}>
                      {stats.totalPL >= 0 ? "+" : ""}{formatCurrency(stats.totalPL)}
                      <span className="text-xs ml-1 font-normal">
                        ({stats.plPercent >= 0 ? "+" : ""}{stats.plPercent.toFixed(2)}%)
                      </span>
                    </span>
                  </div>
                </div>

                <Button variant="outline" className="w-full gap-2" asChild>
                  <Link href="/">
                    <TrendingUp className="h-4 w-4" />
                    View Full Dashboard
                  </Link>
                </Button>
              </>
            ) : (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-10 w-full rounded-lg bg-muted animate-pulse" />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Subscription Card */}
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent pointer-events-none" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-amber-500" />
              Subscription
            </CardTitle>
            <CardDescription>Your current plan and included features.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/40 border border-border">
              <div>
                <p className="font-semibold text-lg">{PLAN.name} Plan</p>
                <p className="text-sm text-muted-foreground">Active since {memberSince}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                <PieChart className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>

            <ul className="space-y-2.5">
              {PLAN.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2.5 text-sm">
                  <CheckCircle className="h-4 w-4 flex-shrink-0 text-primary" />
                  <span className="text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>

            <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-primary" />
                <p className="text-sm font-semibold">Upgrade to Pro</p>
              </div>
              <p className="text-xs text-muted-foreground">
                Unlock unlimited holdings, auto-refresh, advanced analytics, and price alerts.
              </p>
              <Button className="w-full gap-2" size="sm" asChild>
                <Link href="/subscription">
                  View Plans
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Account Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Account Details
          </CardTitle>
          <CardDescription>Your Google account information linked to DSE Portfolio.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { label: "Full Name", value: user?.name ?? "—" },
              { label: "Email Address", value: user?.email ?? "—" },
              { label: "Auth Provider", value: "Google OAuth 2.0" },
              { label: "Account Status", value: "Active ✓" },
            ].map((item) => (
              <div key={item.label} className="space-y-1.5">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{item.label}</p>
                <p className={cn(
                  "text-sm font-medium",
                  item.label === "Account Status" && "text-primary"
                )}>
                  {status === "loading" ? (
                    <span className="block h-4 w-32 rounded bg-muted animate-pulse" />
                  ) : (
                    item.value
                  )}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
