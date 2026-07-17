import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Globe } from "lucide-react"

export default function CreditsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 py-8 animate-in fade-in duration-500">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">Credits</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          The people and projects that make DSE Tracker possible.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Developer</CardTitle>
            <CardDescription>Created and maintained by</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-xl font-bold">
                ZM
              </div>
              <div>
                <h3 className="font-semibold text-lg">Zarif Marzanur</h3>
                <p className="text-sm text-muted-foreground mb-2">Lead Developer & Designer</p>
                <div className="flex gap-2 text-muted-foreground">
                  <a href="#" className="hover:text-foreground transition-colors"><Mail className="h-4 w-4" /></a>
                  <a href="#" className="hover:text-foreground transition-colors"><Globe className="h-4 w-4" /></a>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Open Source Libraries</CardTitle>
            <CardDescription>Built on the shoulders of giants</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="grid grid-cols-2 gap-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> Next.js</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> React</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> Tailwind CSS</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> Recharts</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> Lucide Icons</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> Radix UI</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> Framer Motion</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="text-center pt-8 border-t border-border">
        <p className="text-sm text-muted-foreground">
          Version 1.0.0
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          &copy; {new Date().getFullYear()} DSE Tracker. All rights reserved.
        </p>
      </div>
    </div>
  )
}
