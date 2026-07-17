import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Resend } from "resend"
import * as cheerio from "cheerio"
import { Agent, fetch as undiciFetch } from "undici"
import webpush from "web-push"

const resend = new Resend(process.env.RESEND_API_KEY)
webpush.setVapidDetails(
  "mailto:example@yourdomain.org",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "",
  process.env.VAPID_PRIVATE_KEY || ""
)

const insecureDispatcher = new Agent({ connect: { rejectUnauthorized: false } })

const LETTERS = [
  "A","B","C","D","E","F","G","H","I","J","K","L","M",
  "N","O","P","Q","R","S","T","U","V","W","X","Y","Z","#"
]

async function fetchPricesForLetter(letter: string): Promise<Record<string, number>> {
  const url = `https://www.dsebd.org/latest_share_price_alpha.php?letter=${encodeURIComponent(letter)}`
  const res = await undiciFetch(url, {
    headers: { "User-Agent": "Mozilla/5.0" },
    dispatcher: insecureDispatcher,
  } as any)

  if (!res.ok) return {}

  const html = await res.text()
  const $ = cheerio.load(html)
  const prices: Record<string, number> = {}

  $("table tr").each((_i, el) => {
    const cols = $(el).find("td")
    if (cols.length >= 3) {
      const code = $(cols[1]).text().trim()
      const ltp = parseFloat($(cols[2]).text().trim().replace(/,/g, ""))
      if (code && code !== "TRADING CODE" && !isNaN(ltp)) {
        prices[code] = ltp
      }
    }
  })

  return prices
}

export async function GET() {
  try {
    // 1. Fetch prices from all letter pages in parallel batches
    const BATCH_SIZE = 5
    const currentPrices: Record<string, number> = {}

    for (let i = 0; i < LETTERS.length; i += BATCH_SIZE) {
      const batch = LETTERS.slice(i, i + BATCH_SIZE)
      const results = await Promise.all(batch.map(fetchPricesForLetter))
      results.forEach(prices => Object.assign(currentPrices, prices))
    }

    // 2. Fetch all portfolio items that have a notify price
    const items = await prisma.portfolioItem.findMany({
      where: { notifyPrice: { not: null } },
      include: { 
        user: {
          include: {
            pushSubscriptions: true
          }
        } 
      }
    })

    let notificationsSent = 0
    const ONE_DAY = 24 * 60 * 60 * 1000
    const now = new Date()

    // 3. Check each item and notify if target is reached
    for (const item of items) {
      if (!item.notifyPrice) continue

      const currentPrice = currentPrices[item.tradingCode]
      if (!currentPrice) continue

      if (currentPrice >= item.notifyPrice) {
        // Throttle: only notify once per 24 hours per item
        if (!item.lastNotifiedAt || (now.getTime() - item.lastNotifiedAt.getTime() > ONE_DAY)) {

          // Send email if user has it enabled
          if (item.user.emailNotificationsEnabled && item.user.email) {
            await resend.emails.send({
              from: "DSE Tracker <onboarding@resend.dev>",
              to: item.user.email,
              subject: `🎯 Target Reached: ${item.tradingCode} is now ৳${currentPrice}`,
              html: `
                <h2>Target Price Reached!</h2>
                <p>Your tracked share <strong>${item.tradingCode}</strong> has reached your target price.</p>
                <table>
                  <tr><td><strong>Current LTP:</strong></td><td>৳${currentPrice}</td></tr>
                  <tr><td><strong>Your Target:</strong></td><td>৳${item.notifyPrice}</td></tr>
                  <tr><td><strong>Quantity:</strong></td><td>${item.quantity}</td></tr>
                  <tr><td><strong>Total Value Now:</strong></td><td>৳${(currentPrice * item.quantity).toFixed(2)}</td></tr>
                </table>
                <p><a href="${process.env.NEXTAUTH_URL}">View your portfolio</a></p>
              `
            })
          }

          // Create in-app notification
          await prisma.notification.create({
            data: {
              userId: item.user.id,
              message: `🎯 Target reached! ${item.tradingCode} is now ৳${currentPrice} (Target: ৳${item.notifyPrice})`
            }
          })

          // Web Push Notification
          if (item.user.webNotificationsEnabled && item.user.pushSubscriptions.length > 0) {
            const payload = JSON.stringify({
              title: "Target Reached!",
              body: `${item.tradingCode} has reached your target of ৳${item.notifyPrice}. Current price is ৳${currentPrice}.`,
            });
            for (const sub of item.user.pushSubscriptions) {
              try {
                await webpush.sendNotification({
                  endpoint: sub.endpoint,
                  keys: {
                    p256dh: sub.p256dh,
                    auth: sub.auth
                  }
                }, payload);
              } catch (e) {
                console.error("Web push error for sub", sub.endpoint, e);
              }
            }
          }

          // Update lastNotifiedAt to prevent spam
          await prisma.portfolioItem.update({
            where: { id: item.id },
            data: { lastNotifiedAt: now }
          })

          notificationsSent++
        }
      }
    }

    return NextResponse.json({ success: true, notificationsSent, totalTracked: items.length })
  } catch (error: any) {
    console.error("Cron Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
