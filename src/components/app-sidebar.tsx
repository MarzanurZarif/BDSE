"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import {
  LayoutDashboard,
  LineChart,
  PieChart,
  Wallet,
  Plus,
  Crown,
  Settings,
  LogOut,
  User,
  BookOpen,
  ChevronRight,
  Zap,
} from "lucide-react"
import { cn } from "@/lib/utils"

const mainNavItems = [
  { name: "Overview", href: "/", icon: LayoutDashboard },
  { name: "Analytics", href: "/analytics", icon: LineChart },
  { name: "Holdings", href: "/holdings", icon: PieChart },
  { name: "Accounts", href: "/accounts", icon: Wallet },
]

const toolNavItems = [
  { name: "Add Shares", href: "/add-shares", icon: Plus },
  { name: "Plans & Billing", href: "/subscription", icon: Crown },
]

const accountNavItems = [
  { name: "Profile", href: "/profile", icon: User },
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "About", href: "/about", icon: BookOpen },
  { name: "Credits", href: "/credits", icon: LogOut },
]

// Bottom bar: the 5 most used pages for mobile
const bottomNavItems = [
  { name: "Overview", href: "/", icon: LayoutDashboard },
  { name: "About", href: "/about", icon: BookOpen },
  { name: "Add", href: "/add-shares", icon: Plus },
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Profile", href: "/profile", icon: User },
]

function NavSection({
  label,
  items,
  pathname,
}: {
  label: string
  items: { name: string; href: string; icon: React.ElementType }[]
  pathname: string
}) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-2 px-3">
        {label}
      </p>
      <nav className="flex flex-col gap-0.5">
        {items.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              )}
            >
              <item.icon
                className={cn(
                  "h-4.5 w-4.5 shrink-0 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                )}
                aria-hidden="true"
              />
              <span className="flex-1">{item.name}</span>
              {isActive && <ChevronRight className="h-3.5 w-3.5 opacity-60" />}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

export function AppSidebar() {
  const pathname = usePathname()
  const { data: session, status } = useSession()

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
    <>
      {/* ─── Desktop Sidebar ─── */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 z-50 w-64 flex-col border-r border-border bg-card/80 backdrop-blur-sm">
        {/* Logo */}
        <div className="flex h-16 shrink-0 items-center px-5 border-b border-border/60">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-md shadow-primary/30 transition-transform group-hover:scale-105">
              <PieChart className="h-4.5 w-4.5" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight leading-none">DSE Portfolio</span>
              <span className="text-[9px] text-muted-foreground uppercase tracking-widest leading-none mt-0.5">Tracker</span>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <div className="flex flex-1 flex-col overflow-y-auto px-3 py-5 gap-6">
          <NavSection label="Main" items={mainNavItems} pathname={pathname} />
          <NavSection label="Tools" items={toolNavItems} pathname={pathname} />
          <NavSection label="Account" items={accountNavItems} pathname={pathname} />
        </div>

        {/* Upgrade banner (free plan) */}
        <div className="px-3 pb-3">
          <div className="rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 p-3.5 mb-3">
            <div className="flex items-center gap-2 mb-1.5">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold">Upgrade to Pro</span>
            </div>
            <p className="text-[11px] text-muted-foreground mb-2.5 leading-snug">
              Unlock unlimited holdings & advanced analytics.
            </p>
            <Link
              href="/subscription"
              className="flex items-center justify-center w-full rounded-lg bg-primary text-primary-foreground text-xs font-semibold py-1.5 hover:bg-primary/90 transition-colors"
            >
              View Plans
            </Link>
          </div>

          {/* User card */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border/60 hover:border-border transition-colors">
            {status === "loading" ? (
              <>
                <div className="h-9 w-9 rounded-full bg-muted animate-pulse flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-24 rounded bg-muted animate-pulse" />
                  <div className="h-2.5 w-16 rounded bg-muted animate-pulse" />
                </div>
              </>
            ) : (
              <>
                {user?.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.image}
                    alt={user.name ?? "Profile"}
                    className="h-9 w-9 rounded-full ring-2 ring-primary/20 flex-shrink-0 object-cover"
                  />
                ) : (
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                    {initials}
                  </div>
                )}
                <div className="flex flex-col flex-1 overflow-hidden">
                  <span className="text-sm font-semibold truncate">{user?.name ?? "Guest"}</span>
                  <span className="text-[10px] text-muted-foreground truncate">{user?.email ?? "Not signed in"}</span>
                </div>
                <button
                  title="Sign out"
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="flex-shrink-0 text-muted-foreground hover:text-destructive transition-colors p-1 rounded-md hover:bg-destructive/10"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </aside>

      {/* ─── Mobile Bottom Nav ─── */}
      <div className="lg:hidden fixed bottom-0 left-0 z-50 w-full border-t border-border bg-background/90 backdrop-blur-xl pb-safe">
        <nav className="flex h-16 items-center justify-around px-1">
          {bottomNavItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
            const isAdd = item.href === "/add-shares"
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <div className={cn(
                  "flex items-center justify-center rounded-xl transition-all duration-200",
                  isAdd
                    ? "bg-primary text-primary-foreground w-10 h-10 shadow-md shadow-primary/30"
                    : isActive
                    ? "bg-primary/10 w-9 h-9"
                    : "w-9 h-9"
                )}>
                  <item.icon className={cn("h-5 w-5", isAdd && "h-4.5 w-4.5")} aria-hidden="true" />
                </div>
                <span className={cn(
                  "text-[9px] font-medium leading-none",
                  isAdd && "text-primary"
                )}>
                  {item.name}
                </span>
              </Link>
            )
          })}
        </nav>
      </div>
    </>
  )
}
