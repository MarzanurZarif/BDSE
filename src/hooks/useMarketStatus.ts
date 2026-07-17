"use client"

import { useEffect, useState } from "react"

export function useMarketStatus() {
  const [status, setStatus] = useState<
    "Open" | "Closed" | "Unknown"
  >("Unknown")

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch("/api/market-status")
        const data = await res.json()
        setStatus(data.status)
      } catch {
        setStatus("Unknown")
      }
    }

    fetchStatus()

    // refresh every minute
    const interval = setInterval(fetchStatus, 60000)

    return () => clearInterval(interval)
  }, [])

  return { status }
}