import { NextResponse } from "next/server"
import * as cheerio from "cheerio"
import { Agent, fetch as undiciFetch } from "undici"

export const revalidate = 300

const insecureDispatcher = new Agent({
  connect: { rejectUnauthorized: false },
})

export async function GET() {
  try {
    const response = await undiciFetch(
      "https://www.dsebd.org/latest_share_price_scroll_l.php",
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
        dispatcher: insecureDispatcher,
        cache: "no-store",
      }
    )

    const html = await response.text()
    const $ = cheerio.load(html)

    let marketOpen = false

    $("table tr").each((_i, element) => {
      const cols = $(element).find("td")

      // Skip header rows
      if (cols.length < 11) return

      const tradingCode = $(cols[1]).text().trim()
      if (!tradingCode || tradingCode === "TRADING CODE") return

      const closePrice = parseFloat(
        $(cols[5]).text().trim().replace(/,/g, "")
      )

      if (!isNaN(closePrice) && closePrice === 0) {
        marketOpen = true
        return false // Stops the Cheerio loop
      }
    })

    return NextResponse.json({
      status: marketOpen ? "Open" : "Closed",
    })
  } catch (err) {
    console.error(err)

    return NextResponse.json(
      { status: "Unknown" },
      { status: 500 }
    )
  }
}