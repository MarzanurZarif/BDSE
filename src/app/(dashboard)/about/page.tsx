export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8 py-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">About DSE Tracker</h1>
        <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
          DSE Tracker is a premium portfolio management tool designed specifically for investors in the Dhaka Stock Exchange. Our mission is to bring modern, fast, and beautiful fintech design to the local market.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold border-b border-border pb-2 mb-4">Features</h2>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Real-time Portfolio Tracking (simulated)</li>
            <li>Advanced Analytics and Charts</li>
            <li>Target Price Alerts and Visual Tracking</li>
            <li>Fully Responsive Design for all devices</li>
            <li>Seamless Dark and Light Mode</li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-semibold border-b border-border pb-2 mb-4">Technology</h2>
          <p className="text-muted-foreground leading-relaxed">
            Built with modern web technologies including Next.js App Router, React 18, Tailwind CSS, and Recharts. Designed with a focus on performance, accessibility, and a premium user experience similar to global top-tier SaaS products.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold border-b border-border pb-2 mb-4">Security</h2>
          <p className="text-muted-foreground leading-relaxed">
            Your portfolio data is currently stored locally on your device for maximum privacy. Cloud Sync is an upcoming feature for Pro users that will utilize enterprise-grade encryption.
          </p>
        </div>
      </div>
    </div>
  )
}
