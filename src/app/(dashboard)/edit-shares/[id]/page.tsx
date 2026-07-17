"use client"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { usePortfolio } from "@/context/portfolio-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { formatCurrency } from "@/lib/utils"
import { ArrowLeft, Trash2 } from "lucide-react"

export default function EditSharePage() {
  const router = useRouter()
  const params = useParams()
  const { holdings, updateHolding, deleteHolding, isLoaded } = usePortfolio()
  const id = params.id as string

  const [formData, setFormData] = useState({
    tradingCode: "",
    quantity: "",
    boughtPrice: "",
    targetPrice: "",
    purchaseDate: "",
    broker: "",
    notes: ""
  })

  useEffect(() => {
    if (isLoaded) {
      const holding = holdings.find(h => h.id === id)
      if (holding) {
        setFormData({
          tradingCode: holding.tradingCode,
          quantity: holding.quantity.toString(),
          boughtPrice: holding.boughtPrice.toString(),
          targetPrice: (holding.targetPrice || 0).toString(),
          purchaseDate: holding.purchaseDate || "",
          broker: holding.broker || "",
          notes: holding.notes || ""
        })
      } else {
        router.push('/')
      }
    }
  }, [isLoaded, holdings, id, router])

  const investment = (parseFloat(formData.quantity) || 0) * (parseFloat(formData.boughtPrice) || 0)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateHolding(id, {
      tradingCode: formData.tradingCode.toUpperCase(),
      quantity: parseFloat(formData.quantity),
      boughtPrice: parseFloat(formData.boughtPrice),
      targetPrice: parseFloat(formData.targetPrice),
      purchaseDate: formData.purchaseDate,
      broker: formData.broker,
      notes: formData.notes
    })
    router.push('/')
  }

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this holding?")) {
      deleteHolding(id)
      router.push('/')
    }
  }

  if (!isLoaded) return <div className="p-8">Loading...</div>

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Share</h1>
          <p className="text-muted-foreground mt-1">Update your holding details.</p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Holding Information</CardTitle>
          <CardDescription>Modify the details or remove this asset entirely.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4" id="edit-form">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2 md:col-span-1">
                <label className="text-sm font-medium">Trading Code</label>
                <Input 
                  value={formData.tradingCode}
                  onChange={(e) => setFormData({...formData, tradingCode: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2 col-span-2 md:col-span-1">
                <label className="text-sm font-medium">Purchase Date</label>
                <Input 
                  type="date"
                  value={formData.purchaseDate}
                  onChange={(e) => setFormData({...formData, purchaseDate: e.target.value})}
                />
              </div>
              <div className="space-y-2 col-span-2 md:col-span-1">
                <label className="text-sm font-medium">Quantity</label>
                <Input 
                  type="number" min="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2 col-span-2 md:col-span-1">
                <label className="text-sm font-medium">Bought Price</label>
                <Input 
                  type="number" step="0.1" min="0"
                  value={formData.boughtPrice}
                  onChange={(e) => setFormData({...formData, boughtPrice: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2 col-span-2 md:col-span-1">
                <label className="text-sm font-medium">Target Price</label>
                <Input 
                  type="number" step="0.1" min="0"
                  value={formData.targetPrice}
                  onChange={(e) => setFormData({...formData, targetPrice: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2 col-span-2 md:col-span-1">
                <label className="text-sm font-medium">Broker Name</label>
                <Input 
                  value={formData.broker}
                  onChange={(e) => setFormData({...formData, broker: e.target.value})}
                />
              </div>
              <div className="space-y-2 col-span-2">
                <label className="text-sm font-medium">Notes</label>
                <Input 
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between border-t border-border pt-6">
          <Button variant="destructive" type="button" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" /> Delete Holding
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" form="edit-form">Save Changes</Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
