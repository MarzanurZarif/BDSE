"use client"

import { useState, useEffect } from "react"
import { Bell, Mail, Smartphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { formatCurrency } from "@/lib/utils"
import { Holding, usePortfolio } from "@/context/portfolio-context"
import { useMemo } from "react"
import { AreaChart, Area, ResponsiveContainer, YAxis } from "recharts"

interface PriceAlertModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  holding: Holding | null
}

export function PriceAlertModal({ open, onOpenChange, holding }: PriceAlertModalProps) {
  const { updateHolding } = usePortfolio()
  const [targetPrice, setTargetPrice] = useState<string>("")
  const [emailAlert, setEmailAlert] = useState(true)
  const [pushAlert, setPushAlert] = useState(false)

  const trendData = useMemo(() => {
    if (!holding) return []
    const data = []
    let base = holding.currentLTP * 0.9
    for(let i=0; i<14; i++) {
      base = base + (Math.random() * holding.currentLTP * 0.08 - holding.currentLTP * 0.03)
      data.push({ day: i, value: base })
    }
    data.push({ day: 14, value: holding.currentLTP })
    return data
  }, [holding])

  // Update target price when holding changes
  useEffect(() => {
    if (holding) {
      setTargetPrice(holding.notifyPrice ? holding.notifyPrice.toString() : holding.currentLTP?.toString() || "")
    }
  }, [holding])
  const handleSave = async () => {
    const notifyPrice = parseFloat(targetPrice)
    if (isNaN(notifyPrice)) return

    if (pushAlert) {
      try {
        const permission = await Notification.requestPermission()
        if (permission === 'granted') {
          const swRegistration = await navigator.serviceWorker.register('/sw.js')
          
          // You need to replace NEXT_PUBLIC_VAPID_PUBLIC_KEY in your env
          const applicationServerKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ""
          
          const subscription = await swRegistration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey,
          })
          
          await fetch('/api/notifications/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(subscription),
          })
        } else {
          console.warn("Notification permission denied")
          // Fallback or user alert
        }
      } catch (err) {
        console.error("Failed to subscribe to push notifications", err)
      }
    }

    if (!holding) return
    await updateHolding(holding.id, { notifyPrice })
    onOpenChange(false)
  }

  if (!holding) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>Set Price Alert</DialogTitle>
              <DialogDescription>
                {holding.tradingCode} • LTP: {formatCurrency(holding.currentLTP)}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="space-y-1">
            <div className="text-xs font-medium text-muted-foreground mb-2">14-Day Price Trend</div>
            <div className="h-[80px] w-full bg-muted/20 rounded-md p-1 border border-border/50">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                  <defs>
                    <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <YAxis domain={['dataMin', 'dataMax']} hide />
                  <Area type="monotone" dataKey="value" stroke="#10B981" fillOpacity={1} fill="url(#trendGradient)" strokeWidth={2} isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="targetPrice">Target Price (BDT)</Label>
            <input
              id="targetPrice"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder={holding.currentLTP.toString()}
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              type="number"
            />
          </div>
          
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground">Notification Methods</h4>
            <div className="flex items-center justify-between rounded-lg border border-border p-3 shadow-sm">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Email Alert</Label>
                  <p className="text-[10px] text-muted-foreground">Receive an email when target is hit.</p>
                </div>
              </div>
              <Switch checked={emailAlert} onCheckedChange={setEmailAlert} />
            </div>
            
            <div className="flex items-center justify-between rounded-lg border border-border p-3 shadow-sm">
              <div className="flex items-center gap-3">
                <Smartphone className="h-5 w-5 text-muted-foreground" />
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Push Notification</Label>
                  <p className="text-[10px] text-muted-foreground">Get an in-app alert immediately.</p>
                </div>
              </div>
              <Switch checked={pushAlert} onCheckedChange={setPushAlert} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            Save Alert
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
