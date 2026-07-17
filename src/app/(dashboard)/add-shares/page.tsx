"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { usePortfolio } from "@/context/portfolio-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { formatCurrency } from "@/lib/utils"
import {
  ArrowLeft,
  Check,
  AlertCircle,
  Loader2,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Info,
} from "lucide-react"
import { cn } from "@/lib/utils"

type ShareOption = {
  tradingCode: string
  ltp: number
  change: string
}

// ─── Trading Code Autocomplete ─────────────────────────────────────────────
function TradingCodeInput({
  value,
  onChange,
  onSelect,
}: {
  value: string
  onChange: (val: string) => void
  onSelect: (share: ShareOption) => void
}) {
  const [allShares, setAllShares] = useState<ShareOption[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [highlighted, setHighlighted] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Fetch market list once
  useEffect(() => {
    setLoading(true)
    fetch("/api/market")
      .then((r) => r.json())
      .then((data) => {
        setAllShares(
          (data.shares || []).map((s: any) => ({
            tradingCode: s.tradingCode,
            ltp: s.ltp,
            change: s.change,
          }))
        )
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const query = value.toUpperCase().trim()
  const suggestions =
    query.length === 0
      ? []
      : allShares
          .filter((s) => s.tradingCode.startsWith(query) || s.tradingCode.includes(query))
          .sort((a, b) => {
            const aStarts = a.tradingCode.startsWith(query) ? 0 : 1
            const bStarts = b.tradingCode.startsWith(query) ? 0 : 1
            return aStarts - bStarts || a.tradingCode.localeCompare(b.tradingCode)
          })
          .slice(0, 8)

  const exactMatch = allShares.some((s) => s.tradingCode === query)

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open || suggestions.length === 0) return
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setHighlighted((h) => Math.min(h + 1, suggestions.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setHighlighted((h) => Math.max(h - 1, 0))
    } else if (e.key === "Enter" && highlighted >= 0) {
      e.preventDefault()
      onSelect(suggestions[highlighted])
      setOpen(false)
    } else if (e.key === "Escape") {
      setOpen(false)
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Input
          ref={inputRef}
          id="tradingCode"
          placeholder="e.g. SQURPHARMA"
          required
          autoComplete="off"
          value={value}
          onChange={(e) => {
            onChange(e.target.value.toUpperCase())
            setOpen(true)
            setHighlighted(-1)
          }}
          onFocus={() => {
            if (value.length > 0) setOpen(true)
          }}
          onKeyDown={handleKeyDown}
          className={cn(
            "pr-8 font-mono tracking-wider uppercase transition-colors",
            value.length > 0 &&
              !loading &&
              (exactMatch
                ? "border-primary focus-visible:ring-primary/30"
                : "border-destructive focus-visible:ring-destructive/30")
          )}
        />
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : value.length > 0 ? (
            exactMatch ? (
              <Check className="h-4 w-4 text-primary" />
            ) : (
              <AlertCircle className="h-4 w-4 text-destructive" />
            )
          ) : null}
        </div>
      </div>

      {/* Dropdown */}
      {open && suggestions.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border border-border bg-card shadow-xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150">
          {suggestions.map((s, i) => {
            const changeNum = parseFloat(s.change)
            const isUp = changeNum >= 0
            return (
              <button
                key={s.tradingCode}
                type="button"
                className={cn(
                  "w-full flex items-center justify-between px-3.5 py-2.5 text-sm transition-colors text-left border-b border-border/40 last:border-0",
                  i === highlighted ? "bg-primary/10 text-primary" : "hover:bg-muted/50"
                )}
                onMouseEnter={() => setHighlighted(i)}
                onMouseDown={(e) => {
                  e.preventDefault()
                  onSelect(s)
                  setOpen(false)
                }}
              >
                <span className="font-mono font-semibold tracking-wider">{s.tradingCode}</span>
                <div className="flex items-center gap-2.5">
                  <span className="text-muted-foreground text-xs">LTP</span>
                  <span className="font-medium tabular-nums">{formatCurrency(s.ltp)}</span>
                  <span
                    className={cn(
                      "flex items-center gap-0.5 text-xs font-semibold",
                      isUp ? "text-primary" : "text-destructive"
                    )}
                  >
                    {isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {s.change}%
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* No match warning */}
      {open && query.length >= 2 && suggestions.length === 0 && !loading && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border border-destructive/30 bg-card px-3.5 py-2.5 text-sm text-destructive flex items-center gap-2 shadow-xl">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>No shares found matching &ldquo;{query}&rdquo;</span>
        </div>
      )}
    </div>
  )
}

// ─── Form Field ────────────────────────────────────────────────────────────
function Field({
  label,
  id,
  hint,
  error,
  children,
  className,
}: {
  label: React.ReactNode
  id?: string
  hint?: string
  error?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={id} className="text-sm font-medium flex items-center gap-1.5">
        {label}
      </label>
      {children}
      {error && (
        <p className="text-xs text-destructive flex items-center gap-1 mt-1">
          <AlertCircle className="h-3 w-3 shrink-0" />
          {error}
        </p>
      )}
      {hint && !error && (
        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
          <Info className="h-3 w-3 shrink-0" />
          {hint}
        </p>
      )}
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────
export default function AddSharesPage() {
  const router = useRouter()
  const { addHolding } = usePortfolio()
  const [formData, setFormData] = useState({
    tradingCode: "",
    quantity: "",
    boughtPrice: "",
    targetPrice: "",
    purchaseDate: new Date().toISOString().split("T")[0],
    broker: "",
    notes: "",
  })
  const [selectedShare, setSelectedShare] = useState<ShareOption | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const investment =
    (parseFloat(formData.quantity) || 0) * (parseFloat(formData.boughtPrice) || 0)

  const handleSelectShare = (share: ShareOption) => {
    setSelectedShare(share)
    setFormData((f) => ({
      ...f,
      tradingCode: share.tradingCode,
      boughtPrice: f.boughtPrice || share.ltp.toFixed(1),
    }))
    // clear error
    setErrors((e) => ({ ...e, tradingCode: "" }))
  }

  const isValidCode = selectedShare?.tradingCode === formData.tradingCode.toUpperCase()

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!isValidCode) newErrors.tradingCode = "Please select a valid DSE trading code from the suggestions."
    if (!formData.quantity || parseFloat(formData.quantity) <= 0)
      newErrors.quantity = "Quantity must be greater than zero."
    if (!formData.boughtPrice || parseFloat(formData.boughtPrice) <= 0)
      newErrors.boughtPrice = "Bought price must be greater than zero."
    if (!formData.purchaseDate) newErrors.purchaseDate = "Purchase date is required."
    if (
      formData.targetPrice &&
      parseFloat(formData.targetPrice) > 0 &&
      parseFloat(formData.targetPrice) <= parseFloat(formData.boughtPrice)
    ) {
      newErrors.targetPrice = "Target price should be higher than the bought price."
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    await addHolding({
      tradingCode: formData.tradingCode.toUpperCase(),
      quantity: parseFloat(formData.quantity),
      boughtPrice: parseFloat(formData.boughtPrice),
      notifyPrice: formData.targetPrice ? parseFloat(formData.targetPrice) : 0,
      purchaseDate: formData.purchaseDate,
      broker: formData.broker,
      notes: formData.notes,
    })
    setSubmitting(false)
    router.push("/")
  }

  const plPercent =
    selectedShare && formData.boughtPrice
      ? (((selectedShare.ltp - parseFloat(formData.boughtPrice)) / parseFloat(formData.boughtPrice)) * 100).toFixed(2)
      : null

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="flex-shrink-0">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add Shares</h1>
          <p className="text-muted-foreground mt-1">Record a new share purchase to your portfolio.</p>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* ── Form (wider column) ── */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Transaction Details</CardTitle>
            <CardDescription>Enter the details of your share purchase below.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {/* Row 1: Trading Code + Purchase Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field
                  label="Trading Code"
                  id="tradingCode"
                  error={errors.tradingCode}
                  hint="Start typing to search DSE shares"
                >
                  <TradingCodeInput
                    value={formData.tradingCode}
                    onChange={(val) => {
                      setFormData((f) => ({ ...f, tradingCode: val }))
                      if (selectedShare && val !== selectedShare.tradingCode) {
                        setSelectedShare(null)
                      }
                    }}
                    onSelect={handleSelectShare}
                  />
                </Field>

                <Field label="Purchase Date" id="purchaseDate" error={errors.purchaseDate}>
                  <Input
                    id="purchaseDate"
                    type="date"
                    required
                    value={formData.purchaseDate}
                    max={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                    className={errors.purchaseDate ? "border-destructive" : ""}
                  />
                </Field>
              </div>

              {/* Row 2: Quantity + Bought Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Quantity" id="quantity" error={errors.quantity}>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    step="1"
                    placeholder="e.g. 100"
                    required
                    value={formData.quantity}
                    onChange={(e) => {
                      setFormData({ ...formData, quantity: e.target.value })
                      if (errors.quantity) setErrors((er) => ({ ...er, quantity: "" }))
                    }}
                    className={errors.quantity ? "border-destructive" : ""}
                  />
                </Field>

                <Field
                  label={
                    <>
                      Bought Price
                      {selectedShare && (
                        <span className="ml-1.5 text-xs text-muted-foreground font-normal">
                          (LTP: {formatCurrency(selectedShare.ltp)})
                        </span>
                      )}
                    </>
                  }
                  id="boughtPrice"
                  error={errors.boughtPrice}
                >
                  <Input
                    id="boughtPrice"
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="e.g. 250.50"
                    required
                    value={formData.boughtPrice}
                    onChange={(e) => {
                      setFormData({ ...formData, boughtPrice: e.target.value })
                      if (errors.boughtPrice) setErrors((er) => ({ ...er, boughtPrice: "" }))
                    }}
                    className={errors.boughtPrice ? "border-destructive" : ""}
                  />
                </Field>
              </div>

              {/* Row 3: Target Price + Broker */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field
                  label="Target Price"
                  id="targetPrice"
                  hint="Optional — get notified when LTP hits this price"
                  error={errors.targetPrice}
                >
                  <Input
                    id="targetPrice"
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="e.g. 300.00"
                    value={formData.targetPrice}
                    onChange={(e) => {
                      setFormData({ ...formData, targetPrice: e.target.value })
                      if (errors.targetPrice) setErrors((er) => ({ ...er, targetPrice: "" }))
                    }}
                    className={errors.targetPrice ? "border-destructive" : ""}
                  />
                </Field>

                <Field label="Broker Name" id="broker" hint="Optional">
                  <Input
                    id="broker"
                    placeholder="e.g. City Brokerage"
                    value={formData.broker}
                    onChange={(e) => setFormData({ ...formData, broker: e.target.value })}
                  />
                </Field>
              </div>

              {/* Row 4: Notes */}
              <Field label="Notes" id="notes" hint="Optional — e.g. long term hold, dividend play">
                <Input
                  id="notes"
                  placeholder="Any notes about this investment..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </Field>

              {/* Submit Row */}
              <div className="pt-2 flex flex-col-reverse sm:flex-row justify-end gap-2">
                <Button variant="outline" type="button" onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="min-w-[160px] gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      Save Transaction
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* ── Live Preview (sticky) ── */}
        <div className="lg:col-span-2">
          <div className="lg:sticky lg:top-[4.5rem] space-y-4">
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-transparent overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Live Preview
                </CardTitle>
                <CardDescription>Calculated as you type.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Stock badge */}
                <div className="rounded-xl bg-card/80 border border-border/60 p-4 space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Trading Code
                  </p>
                  <p className="text-3xl font-bold font-mono tracking-widest uppercase">
                    {formData.tradingCode || "—"}
                  </p>
                  {selectedShare && (
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-xs text-muted-foreground">LTP:</span>
                      <span className="text-xs font-semibold">{formatCurrency(selectedShare.ltp)}</span>
                      <span
                        className={cn(
                          "flex items-center gap-0.5 text-xs font-semibold",
                          parseFloat(selectedShare.change) >= 0 ? "text-primary" : "text-destructive"
                        )}
                      >
                        {parseFloat(selectedShare.change) >= 0 ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        ({parseFloat(selectedShare.change) >= 0 ? "+" : ""}{selectedShare.change}%)
                      </span>
                    </div>
                  )}
                </div>

                {/* Summary rows */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Quantity</span>
                    <span className="font-semibold tabular-nums">{formData.quantity || "0"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Avg. Price</span>
                    <span className="font-semibold tabular-nums">
                      {formatCurrency(parseFloat(formData.boughtPrice) || 0)}
                    </span>
                  </div>
                  {formData.targetPrice && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Target Price</span>
                      <span className="font-semibold text-primary tabular-nums">
                        {formatCurrency(parseFloat(formData.targetPrice) || 0)}
                      </span>
                    </div>
                  )}
                  {selectedShare && formData.boughtPrice && plPercent !== null && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">vs Current LTP</span>
                      <span
                        className={cn(
                          "font-semibold tabular-nums",
                          parseFloat(plPercent) >= 0 ? "text-primary" : "text-destructive"
                        )}
                      >
                        {parseFloat(plPercent) >= 0 ? "+" : ""}{plPercent}%
                      </span>
                    </div>
                  )}
                </div>

                {/* Total investment highlight */}
                <div className="rounded-xl bg-primary/10 border border-primary/20 p-4 flex justify-between items-center">
                  <span className="font-semibold text-sm">Total Investment</span>
                  <span className="text-xl font-bold text-primary tabular-nums">
                    {formatCurrency(investment)}
                  </span>
                </div>

                {/* Purchase date */}
                {formData.purchaseDate && (
                  <div className="text-xs text-muted-foreground text-center">
                    Purchase date: {new Date(formData.purchaseDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
