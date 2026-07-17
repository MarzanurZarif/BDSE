"use client"
import { useRouter } from "next/navigation";

import { useMemo, useState, useEffect, useRef } from "react"
import { NewsFeed } from "@/components/news-feed"
import { usePortfolio } from "@/context/portfolio-context"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils"
import { Settings, Bell, ArrowUpDown, Trash2 } from "lucide-react"
import { EmptyPortfolio } from "@/components/empty-portfolio"
import { PriceAlertModal } from "@/components/price-alert-modal"
import { Holding } from "@/context/portfolio-context"

function useFlash(value: number) {
  const [flashClass, setFlashClass] = useState("");
  const prevRef = useRef(value);
  
  useEffect(() => {
    if (prevRef.current !== 0) { // Don't flash on initial load if possible
      if (value > prevRef.current) {
        setFlashClass("animate-flash-green rounded px-1 -mx-1 inline-block");
        const t = setTimeout(() => setFlashClass(""), 1500);
        prevRef.current = value;
        return () => clearTimeout(t);
      } else if (value < prevRef.current) {
        setFlashClass("animate-flash-red rounded px-1 -mx-1 inline-block");
        const t = setTimeout(() => setFlashClass(""), 1500);
        prevRef.current = value;
        return () => clearTimeout(t);
      }
    } else {
      prevRef.current = value;
    }
  }, [value]);
  
  return flashClass;
}

export default function DashboardPage() {
  const router = useRouter();
  const { holdings, isLoaded, deleteHolding } = usePortfolio()
  const [isClient, setIsClient] = useState(false)
  const [alertModalOpen, setAlertModalOpen] = useState(false)
  const [selectedHolding, setSelectedHolding] = useState<Holding | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: "asc" | "desc" } | null>(null)

  const filteredHoldings = useMemo(() => {
    let result = [...holdings];
    if (searchQuery.trim()) {
      result = result.filter(h => h.tradingCode.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    if (sortConfig !== null) {
      result.sort((a, b) => {
        let aValue: any = a[sortConfig.key as keyof typeof a];
        let bValue: any = b[sortConfig.key as keyof typeof b];
        
        if (sortConfig.key === 'currentValue') {
          aValue = a.currentLTP * a.quantity;
          bValue = b.currentLTP * b.quantity;
        } else if (sortConfig.key === 'profitLoss') {
          aValue = (a.currentLTP * a.quantity) - (a.boughtPrice * a.quantity);
          bValue = (b.currentLTP * b.quantity) - (b.boughtPrice * b.quantity);
        }

        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    // console.log(result);
    return result;
  }, [holdings, searchQuery, sortConfig]);

  const requestSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this holding?")) {
      deleteHolding(id)
      router.refresh()
    }
  }

  // Avoid hydration mismatch by rendering strictly client side for formatted dynamic data
  useEffect(() => {
    setIsClient(true)
  }, [])

    const stats = useMemo(() => {
    const totalInvestment = holdings.reduce((acc, h) => acc + (h.boughtPrice * h.quantity), 0)
    const currentValue = holdings.reduce((acc, h) => acc + (h.currentLTP * h.quantity), 0)
    const profitLoss = currentValue - totalInvestment
    const profitLossPercent = totalInvestment > 0 ? (profitLoss / totalInvestment) * 100 : 0
    const todayGain = holdings.reduce((acc, h) => acc + ((h.currentLTP * h.todayChange / 100) * h.quantity), 0)

    return {
      totalInvestment,
      currentValue,
      profitLoss,
      profitLossPercent,
      todayGain,
      companies: holdings.length,
      totalHoldings: holdings.reduce((acc, h) => acc + h.quantity, 0)
    }
  }, [holdings])

  const cvFlash = useFlash(stats.currentValue);
  const tgFlash = useFlash(stats.todayGain);

  if (!isClient || !isLoaded) {
    return <div className="h-full w-full flex items-center justify-center min-h-[50vh]">Loading dashboard...</div>
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Good Morning, Zarif</h1>
          <p className="text-muted-foreground mt-1">Your portfolio is up <span className="text-primary font-semibold">+4.2%</span> since last close.</p>
        </div>
        <div className="md:text-right overflow-hidden flex-1 min-w-0 md:max-w-xs">
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Portfolio Value</p>
          <p className={`text-3xl font-bold tabular-nums truncate max-w-full ${cvFlash}`}>{formatCurrency(stats.currentValue)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 shrink-0">
        <div className="bg-card p-5 rounded-2xl border border-border shadow-xl">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-2">Total Investment</p>
          <div className="flex flex-col gap-1 overflow-hidden">
            <span className="text-xl md:text-2xl font-bold tracking-tight truncate">{formatCurrency(stats.totalInvestment)}</span>
          </div>
        </div>
        
        <div className="bg-card p-5 rounded-2xl border border-border shadow-xl">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-2">Overall P/L</p>
          <div className="flex flex-col gap-1 overflow-hidden">
            <span className={`text-xl md:text-2xl font-bold tracking-tight truncate ${stats.profitLoss >= 0 ? 'text-primary' : 'text-red-500'}`}>
              {stats.profitLoss >= 0 ? '+' : ''}{formatCurrency(stats.profitLoss)}
            </span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded w-fit ${stats.profitLoss >= 0 ? 'bg-primary/10 text-primary' : 'bg-red-500/10 text-red-500'}`}>
              {stats.profitLossPercent >= 0 ? '+' : ''}{formatPercent(stats.profitLossPercent)}
            </span>
          </div>
        </div>

        <div className={`bg-card p-5 rounded-2xl border border-border shadow-xl border-l-4 ${stats.todayGain >= 0 ? 'border-l-primary' : 'border-l-red-500'}`}>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-2">Today&apos;s Gain</p>
          <div className="flex flex-col gap-1 overflow-hidden">
            <span className={`text-xl md:text-2xl font-bold tracking-tight truncate ${stats.todayGain >= 0 ? 'text-primary' : 'text-red-500'} ${tgFlash}`}>
              {stats.todayGain >= 0 ? '+' : ''}{formatCurrency(stats.todayGain)}
            </span>
            <span className={`text-xs font-semibold ${stats.todayGain >= 0 ? 'text-primary' : 'text-red-500'}`}>
              Based on LTP
            </span>
          </div>
        </div>

        <div className="bg-card p-5 rounded-2xl border border-border shadow-xl">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-2">Holdings</p>
          <div className="flex flex-col gap-1 overflow-hidden">
            <span className="text-xl md:text-2xl font-bold tracking-tight truncate">{stats.companies} Items</span>
            <span className="text-xs text-muted-foreground">{formatNumber(stats.totalHoldings)} Shares</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Your Portfolio Items</h2>
          {holdings.length > 0 && (
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                type="search" 
                placeholder="Filter by trading code..." 
                className="pl-9 bg-background"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          )}
        </div>
        {holdings.length === 0 ? (
          <EmptyPortfolio />
        ) : (
        
        <>
        <div className="hidden md:block border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer hover:text-foreground transition-colors" onClick={() => requestSort("tradingCode")}>
                <div className="flex items-center gap-1">Trading Code <ArrowUpDown className="h-3 w-3" /></div>
              </TableHead>
              <TableHead className="text-right">LTP</TableHead>
              <TableHead className="text-right">High</TableHead>
              <TableHead className="text-right">Low</TableHead>
              {/* <TableHead className="text-right">Avg Price</TableHead> */}
              <TableHead className="text-right">Qty</TableHead>
              <TableHead className="text-right cursor-pointer hover:text-foreground transition-colors" onClick={() => requestSort("currentValue")}>
                <div className="flex items-center justify-end gap-1">Current Value <ArrowUpDown className="h-3 w-3" /></div>
              </TableHead>
              <TableHead className="text-right cursor-pointer hover:text-foreground transition-colors" onClick={() => requestSort("profitLoss")}>
                <div className="flex items-center justify-end gap-1">Profit/Loss <ArrowUpDown className="h-3 w-3" /></div>
              </TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredHoldings.map((holding) => {
                const totalInvested = holding.boughtPrice * holding.quantity
                const currentValue = holding.currentLTP * holding.quantity
                const profitLoss = currentValue - totalInvested
                const profitLossPercent = (profitLoss / totalInvested) * 100
                const targetHit = holding.targetPrice > 0 && holding.currentLTP >= holding.targetPrice
                
                return (
                  <TableRow 
                    key={holding.id}
                    className={`group transition-colors hover:bg-muted/50 ${targetHit ? 'bg-primary/5 hover:bg-primary/10 relative z-10 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : ''}`}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3 overflow-hidden pr-2">
                        <div className="w-8 h-8 rounded bg-secondary-card border border-border flex items-center justify-center font-bold text-xs text-foreground">
                          {holding.tradingCode.substring(0, 2)}
                        </div>
                        <div>
                          <div className="font-bold text-foreground">
                            {holding.tradingCode}
                            {targetHit && (
                              <Badge variant="default" className="bg-primary text-primary-foreground text-[10px] h-4 px-1 py-0 shadow-sm shadow-primary/30 ml-2">
                                🎯 Hit
                              </Badge>
                            )}
                          </div>
                          <div className="text-[10px] text-muted-foreground">Company Name</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="font-medium">{formatCurrency(holding.currentLTP)}</div>
                      <div className={`text-[10px] font-semibold ${holding.todayChange >= 0 ? 'text-primary' : 'text-red-500'}`}>
                        {holding.todayChange > 0 ? '+' : ''}{formatPercent(holding.todayChange)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(holding.currentHIGH)}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(holding.currentLOW)}</TableCell>
                    {/* <TableCell className="text-right font-medium">{formatCurrency(holding.boughtPrice)}</TableCell> */}
                    <TableCell className="text-right font-medium">{formatNumber(holding.quantity)}</TableCell>
                    <TableCell className="text-right font-bold text-foreground">{formatCurrency(currentValue)}</TableCell>
                    <TableCell className="text-right">
                      <div className={`font-bold ${profitLoss >= 0 ? 'text-primary' : 'text-red-500'}`}>
                        {profitLoss >= 0 ? '+' : ''}{formatCurrency(profitLoss)}
                      </div>
                      <div className={`text-[10px] font-semibold px-1.5 py-0.5 rounded inline-block mt-1 ${profitLossPercent >= 0 ? 'bg-primary/10 text-primary' : 'bg-red-500/10 text-red-500'}`}>
                        {profitLossPercent >= 0 ? '+' : ''}{formatPercent(profitLossPercent)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          className="text-muted-foreground hover:text-primary p-2"
                          onClick={() => {
                            setSelectedHolding(holding)
                            setAlertModalOpen(true)
                          }}
                        >
                          <span className="sr-only">Set Alert</span>
                          <Bell className="h-4 w-4" />
                        </button>
                        <button onClick={() => router.push(`/edit-shares/${holding.id}`)} className="text-muted-foreground hover:text-foreground p-2">
                          <span className="sr-only">Edit</span>
                          <Settings className="h-4 w-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            {filteredHoldings.length === 0 && holdings.length > 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  No holdings found matching "{searchQuery}"
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        </div>
        <div className="md:hidden grid grid-cols-1 gap-4">
          {filteredHoldings.length === 0 && holdings.length > 0 && (
            <div className="p-8 text-center text-muted-foreground border border-dashed rounded-xl bg-card/50">
              No holdings found matching "{searchQuery}"
            </div>
          )}
          {filteredHoldings.map((holding) => {
            const totalInvested = holding.boughtPrice * holding.quantity
            const currentValue = holding.currentLTP * holding.quantity
            const profitLoss = currentValue - totalInvested
            const profitLossPercent = (profitLoss / totalInvested) * 100
            const targetHit = holding.targetPrice > 0 && holding.currentLTP >= holding.targetPrice
            
            return (
              <div key={holding.id} className={`bg-card border border-border rounded-xl p-4 shadow-sm relative overflow-hidden ${targetHit ? 'bg-primary/5 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : ''}`}>
                {targetHit && <div className="absolute top-0 right-0 px-2 py-0.5 bg-primary/20 text-primary rounded-bl-lg text-[10px] font-bold shadow-sm shadow-primary/30 flex items-center gap-1">🎯 Hit</div>}
                
                <div className="flex justify-between items-start mb-4 gap-2">
                  <div className="flex items-center gap-2 overflow-hidden flex-1">
                    <div className="w-10 h-10 rounded-lg bg-secondary-card border border-border flex items-center justify-center font-bold text-sm text-foreground shrink-0">
                      {holding.tradingCode.substring(0, 2)}
                    </div>
                    <div className="overflow-hidden">
                      <h3 className="font-bold text-base sm:text-lg text-foreground leading-none truncate">{holding.tradingCode}</h3>
                      <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 truncate">Qty: {formatNumber(holding.quantity)}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 max-w-[45%]">
                    <p className="font-bold text-sm sm:text-base leading-none truncate">{formatCurrency(currentValue)}</p>
                    <p className={`text-[10px] sm:text-xs font-semibold mt-1 truncate ${profitLoss >= 0 ? 'text-primary' : 'text-red-500'}`}>
                      {profitLoss >= 0 ? '+' : ''}{formatCurrency(profitLoss)}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm mb-4 bg-muted/30 p-3 rounded-lg">
                  <div>
                    <p className="text-muted-foreground text-[10px] uppercase tracking-wider mb-0.5">High</p>
                    <p className="font-medium">{formatCurrency(holding.currentHIGH)}</p>
                  </div>

                  <div>
                    <p className="text-muted-foreground text-[10px] uppercase tracking-wider mb-0.5">Low</p>
                    <p className="font-medium">{formatCurrency(holding.currentLOW)}</p>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-muted-foreground text-[10px] uppercase tracking-wider mb-0.5">LTP</p>
                    <div className="flex items-center justify-end gap-1.5">
                      <p className="font-medium">{formatCurrency(holding.currentLTP)}</p>
                      <span className={`text-[10px] font-semibold px-1 py-0.5 rounded ${holding.todayChange >= 0 ? 'bg-primary/10 text-primary' : 'bg-red-500/10 text-red-500'}`}>
                        {holding.todayChange > 0 ? '+' : ''}{formatPercent(holding.todayChange)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <div className={`text-[10px] font-semibold px-2 py-1 rounded-full ${profitLossPercent >= 0 ? 'bg-primary/10 text-primary' : 'bg-red-500/10 text-red-500'}`}>
                    Returns: {profitLossPercent >= 0 ? '+' : ''}{formatPercent(profitLossPercent)}
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleDelete(holding.id)} className="text-muted-foreground hover:text-red-500 p-2 flex items-center gap-1 text-xs rounded-md hover:bg-muted/50 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <button 
                       className="text-muted-foreground hover:text-primary p-2 flex items-center gap-1 text-xs rounded-md hover:bg-muted/50 transition-colors"
                       onClick={() => {
                         setSelectedHolding(holding)
                         setAlertModalOpen(true)
                       }}
                    >
                      <Bell className="h-4 w-4" />
                    </button>
                    <button onClick={() => router.push(`/edit-shares/${holding.id}`)} className="text-muted-foreground hover:text-foreground p-2 flex items-center gap-1 text-xs rounded-md hover:bg-muted/50 transition-colors">
                      <Settings className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        </>
          )}
      </div>

      <div className="mb-8">
        <NewsFeed holdings={holdings} />
      </div>

      <PriceAlertModal 
        open={alertModalOpen} 
        onOpenChange={setAlertModalOpen} 
        holding={selectedHolding} 
      />
    </div>
  )
}
