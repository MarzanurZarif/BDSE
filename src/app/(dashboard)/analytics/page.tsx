"use client"

import { useMemo, useState, useEffect } from "react"
import { usePortfolio } from "@/context/portfolio-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RePieChart, Pie, Cell, Legend
} from "recharts"


const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const isSector = data.name !== "value" && data.name !== undefined; 
    return (
      <div className="bg-card border border-border p-3 rounded-lg shadow-xl animate-in zoom-in-95 duration-200 ring-1 ring-border shadow-black/10 dark:shadow-white/5">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">{isSector ? data.name : label}</p>
        <p className="text-lg font-bold text-foreground flex items-center gap-2">
          {isSector && <span className="w-2.5 h-2.5 rounded-full inline-block" style={{backgroundColor: data.payload.fill}}></span>}
          BDT {data.value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

export default function AnalyticsPage() {
  const { holdings } = usePortfolio()
  const [isClient, setIsClient] = useState(false)
  
  useEffect(() => { 
    setIsClient(true) 
  }, [])

  const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4']

  const sectorData = useMemo(() => {
    const data: Record<string, number> = {}
    holdings.forEach(h => {
      const sector = h.sector || 'Other'
      data[sector] = (data[sector] || 0) + (h.currentLTP * h.quantity)
    })
    return Object.entries(data).map(([name, value]) => ({ name, value }))
  }, [holdings])

  const historyData = useMemo(() => {
    const data = []
    let baseValue = 500000
    for(let i = 1; i <= 30; i++) {
      // Create some slightly random data for chart
      baseValue = baseValue * (1 + (Math.random() * 0.04 - 0.015))
      data.push({
        day: `Day ${i}`,
        value: Math.round(baseValue)
      })
    }
    return data
  }, [])

  if (!isClient) return <div className="h-full flex items-center justify-center min-h-[50vh]">Loading analytics...</div>

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground mt-1">Detailed breakdown of your portfolio performance.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Portfolio Value History (30 Days)</CardTitle>
            <CardDescription>Simulated performance over the last month.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value/1000}k`} />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: "hsl(var(--muted-foreground))", strokeWidth: 1, strokeDasharray: "3 3" }} />
                  <Area type="monotone" dataKey="value" stroke="#10B981" fillOpacity={1} fill="url(#colorValue)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sector Allocation</CardTitle>
            <CardDescription>Distribution by industry sector.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={sectorData}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {sectorData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: "hsl(var(--muted-foreground))", strokeWidth: 1, strokeDasharray: "3 3" }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </RePieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
