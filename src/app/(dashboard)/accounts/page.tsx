import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Wallet, Building2 } from "lucide-react"

export default function AccountsPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Accounts</h1>
          <p className="text-muted-foreground mt-1">Manage your linked broker accounts.</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Link Broker
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-primary/20 bg-primary/5 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">Active</span>
            </div>
            <CardTitle className="mt-4 text-xl">City Brokerage</CardTitle>
            <CardDescription>Primary trading account</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 mt-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Account Number</span>
                <span className="font-medium">CBL-948210</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Cash Balance</span>
                <span className="font-medium">৳ 45,210.00</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
