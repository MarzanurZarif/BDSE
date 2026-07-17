"use client"

import { FolderOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function EmptyPortfolio() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center border-2 rounded-2xl border-dashed border-border bg-card/50">
      <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-6 shadow-inner">
        <FolderOpen className="h-10 w-10 text-primary" />
      </div>
      <h3 className="text-2xl font-bold tracking-tight mb-2 text-foreground">No shares in your portfolio</h3>
      <p className="text-muted-foreground mb-8 max-w-sm">
        You haven&apos;t added any shares to your portfolio yet. Add your first share to start tracking your performance.
      </p>
      <Button size="lg" className="font-semibold shadow-[0_0_15px_rgba(16,185,129,0.2)]" asChild>
        <Link href="/add-shares">+ Add your first share</Link>
      </Button>
    </div>
  )
}
