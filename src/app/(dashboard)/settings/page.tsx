"use client"

import { useTheme } from "next-themes"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"

export default function SettingsPage() {
  const { setTheme, theme } = useTheme()

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-muted-foreground">Manage your account settings and preferences.</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Customize the look and feel of the application.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col space-y-2">
              <span className="text-sm font-medium">Theme</span>
              <div className="flex gap-4">
                <Button 
                  variant={theme === 'light' ? 'default' : 'outline'} 
                  onClick={() => setTheme('light')}
                  className="w-24"
                >
                  Light
                </Button>
                <Button 
                  variant={theme === 'dark' ? 'default' : 'outline'} 
                  onClick={() => setTheme('dark')}
                  className="w-24"
                >
                  Dark
                </Button>
                <Button 
                  variant={theme === 'system' ? 'default' : 'outline'} 
                  onClick={() => setTheme('system')}
                  className="w-24"
                >
                  System
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
            <CardDescription>Update your personal information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input defaultValue="Zarif Marzanur" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input defaultValue="zarifmarzanur@gmail.com" disabled />
              </div>
            </div>
            <Button>Save Changes</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>Configure how the application behaves.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox id="auto-refresh" defaultChecked />
              <label htmlFor="auto-refresh" className="text-sm font-medium leading-none">
                Auto-refresh portfolio prices
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="notifications" defaultChecked />
              <label htmlFor="notifications" className="text-sm font-medium leading-none">
                Enable target alerts & notifications
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="marketing" />
              <label htmlFor="marketing" className="text-sm font-medium leading-none">
                Receive marketing emails
              </label>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-500/20">
          <CardHeader>
            <CardTitle className="text-red-500">Danger Zone</CardTitle>
            <CardDescription>Irreversible and destructive actions.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive">Delete Account</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
