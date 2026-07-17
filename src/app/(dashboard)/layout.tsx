"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { AppNavbar } from "@/components/app-navbar"
import { AppSidebar } from "@/components/app-sidebar"
import { PortfolioProvider } from "@/context/portfolio-context"
import { Loader2, PieChart } from "lucide-react"

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login")
    }
  }, [status, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/30">
          <PieChart className="h-7 w-7" />
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm font-medium">Loading your portfolio...</span>
        </div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    return null
  }

  return <>{children}</>
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard>
      <PortfolioProvider>
        <div className="flex min-h-screen w-full bg-background relative overflow-hidden">
          <AppSidebar />
          <div className="flex flex-col flex-1 min-w-0 transition-all duration-300 lg:ml-64">
            <AppNavbar />
            <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full h-[calc(100vh-64px)] pb-24 lg:pb-8">
              <div className="mx-auto max-w-7xl w-full">
                {children}
              </div>
            </main>
          </div>
        </div>
      </PortfolioProvider>
    </AuthGuard>
  )
}
