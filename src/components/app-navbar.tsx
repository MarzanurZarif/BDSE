"use client"

import { Bell, Search, RefreshCcw, PieChart, User } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { useSession } from "next-auth/react"
import { usePortfolio } from "@/context/portfolio-context"
import { useMarketStatus } from "@/hooks/useMarketStatus"

export function AppNavbar() {
  const { data: session } = useSession()
  const { refresh } = usePortfolio()
  const { status: marketStatus } = useMarketStatus()

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
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-border bg-background/80 backdrop-blur-md px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8 justify-between">
      {/* Mobile: Logo */}
      <div className="lg:hidden flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-md">
          <PieChart className="h-5 w-5" />
        </div>
        <span className="text-sm font-bold tracking-tight">DSE Portfolio</span>
      </div>

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6 items-center justify-end lg:justify-between">
        {/* Desktop search */}
        <form className="relative hidden lg:flex flex-1 max-w-sm" action="#" method="GET">
          <label htmlFor="search-field" className="sr-only">
            Search
          </label>
          <Search
            className="pointer-events-none absolute inset-y-0 left-3 h-full w-4 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            id="search-field"
            className="block h-9 w-full rounded-lg border border-border pl-9 pr-3 shadow-none focus-visible:outline-none focus-visible:ring-0 focus-visible:border-primary bg-card text-sm"
            placeholder="Search Trading Code..."
            type="search"
            name="search"
          />
        </form>

        <div className="flex items-center gap-x-2 lg:gap-x-3">
          {/* Market status */}
          {/* <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium border border-primary/20">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Market Open
          </div> */}
          
          <div className={`hidden lg:flex items-center gap-2 px-3 py-1 text-primary rounded-full text-xs font-medium border ${marketStatus === "Open" ? "bg-primary/10 text-primary border-primary/20" : "bg-red-500/10 text-red-500 border-red-500"}`}>
            {marketStatus === "Open" ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span>Market Open</span>
              </>
            ) : (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                <span>Market Closed</span>
              </>
            )}
          </div>

          {/* Refresh */}
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground"
            onClick={refresh}
            title="Refresh portfolio"
          >
            <span className="sr-only">Refresh Portfolio</span>
            <RefreshCcw className="h-4.5 w-4.5" aria-hidden="true" />
          </Button>

          <ThemeToggle />

          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <span className="sr-only">View notifications</span>
            <Bell className="h-4.5 w-4.5" aria-hidden="true" />
          </Button>

          <div className="hidden lg:block w-px h-6 bg-border" />

          {/* Add Share button – desktop */}
          <Button className="hidden lg:flex shadow-[0_0_15px_rgba(16,185,129,0.2)] font-bold gap-1.5" asChild>
            <Link href="/add-shares">
              <span>+</span> Add Share
            </Link>
          </Button>

          {/* User avatar – desktop */}
          <Link
            href="/profile"
            className="hidden lg:flex items-center gap-2.5 rounded-full hover:opacity-80 transition-opacity"
            title="View profile"
          >
            {user?.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.image}
                alt={user.name ?? "Profile"}
                className="h-8 w-8 rounded-full ring-2 ring-border object-cover"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center text-xs font-bold text-white ring-2 ring-border">
                {session ? initials : <User className="h-4 w-4" />}
              </div>
            )}
          </Link>
        </div>
      </div>
    </header>
  )
}
