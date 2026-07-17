"use client"
import { usePortfolio } from "@/context/portfolio-context"
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function HoldingsPage() {
  const { holdings } = usePortfolio()
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Holdings</h1>
        <p className="text-muted-foreground mt-1">Detailed view of your current holdings.</p>
      </div>
      <div className="border border-border rounded-lg overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Trading Code</TableHead>
              <TableHead className="text-right">Qty</TableHead>
              <TableHead className="text-right">Avg Price</TableHead>
              <TableHead className="text-right">LTP</TableHead>
              <TableHead className="text-right">Current Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {holdings.map((holding) => {
              const currentValue = holding.currentLTP * holding.quantity;
              return (
                <TableRow key={holding.id}>
                  <TableCell className="font-bold">{holding.tradingCode}</TableCell>
                  <TableCell className="text-right">{formatNumber(holding.quantity)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(holding.boughtPrice)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(holding.currentLTP)}</TableCell>
                  <TableCell className="text-right font-bold">{formatCurrency(currentValue)}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
