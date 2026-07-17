"use client"

import { Check, Star } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const tiers = [
  {
    name: 'Free',
    id: 'tier-free',
    href: '#',
    priceMonthly: '৳0',
    description: 'Perfect for beginners just starting out.',
    features: ['Up to 10 Holdings', 'Dashboard Access', 'Manual Refresh', 'Basic Sorting'],
    mostPopular: false,
  },
  {
    name: 'Pro',
    id: 'tier-pro',
    href: '#',
    priceMonthly: '৳299',
    description: 'Advanced features for serious investors.',
    features: [
      'Unlimited Holdings',
      'Auto Refresh',
      'Advanced Analytics',
      'Export CSV',
      'Portfolio Backup',
      'Cloud Sync',
      'Target Alerts'
    ],
    mostPopular: true,
  },
  {
    name: 'Lifetime',
    id: 'tier-lifetime',
    href: '#',
    priceMonthly: '৳9,999',
    description: 'Pay once, enjoy forever with priority support.',
    features: [
      'Everything in Pro',
      'Lifetime Updates',
      'Priority Support',
      'Early Access Features',
      'Dedicated Account Manager'
    ],
    mostPopular: false,
  },
]

export default function SubscriptionPage() {
  return (
    <div className="py-8 animate-in fade-in duration-500">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Pricing that scales with you</h2>
        <p className="mt-4 text-lg text-muted-foreground">
          Choose the right plan to manage and grow your DSE portfolio with powerful analytics and automation.
        </p>
      </div>
      
      <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3 items-center">
        {tiers.map((tier) => (
          <Card 
            key={tier.id} 
            className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
              tier.mostPopular ? 'border-primary shadow-md md:scale-105 z-10' : ''
            } ${tier.name === 'Lifetime' ? 'bg-gradient-to-br from-amber-500/10 to-amber-700/5 border-amber-500/30' : ''}`}
          >
            {tier.mostPopular && (
              <div className="absolute top-0 right-0 bg-primary px-3 py-1 text-xs font-medium text-primary-foreground rounded-bl-lg">
                Most Popular
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                {tier.name === 'Lifetime' && <Star className="h-5 w-5 text-amber-500 fill-amber-500" />}
                {tier.name}
              </CardTitle>
              <div className="flex items-baseline gap-x-1 mt-4">
                <span className="text-4xl font-bold tracking-tight">{tier.priceMonthly}</span>
                {tier.name !== 'Lifetime' && tier.name !== 'Free' && <span className="text-sm font-semibold text-muted-foreground">/month</span>}
              </div>
              <CardDescription className="mt-2 text-sm">{tier.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul role="list" className="space-y-3 text-sm">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex gap-x-3 text-muted-foreground">
                    <Check className={`h-5 w-5 flex-none ${tier.name === 'Lifetime' ? 'text-amber-500' : 'text-primary'}`} aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                variant={tier.mostPopular ? 'default' : tier.name === 'Lifetime' ? 'default' : 'outline'}
                style={tier.name === 'Lifetime' ? { backgroundColor: '#F59E0B', color: 'white' } : {}}
              >
                {tier.name === 'Free' ? 'Current Plan' : 'Subscribe'}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
