import { NextResponse } from "next/server"
import * as cheerio from "cheerio"
import { Agent, fetch as undiciFetch } from "undici"

export const revalidate = 300 // cache for 5 minutes (scraping 27 pages is heavy)

const insecureDispatcher = new Agent({
  connect: { rejectUnauthorized: false },
})

const LETTERS = [
  "A","B","C","D","E","F","G","H","I","J","K","L","M",
  "N","O","P","Q","R","S","T","U","V","W","X","Y","Z","#"
]

async function fetchSharesForLetter(letter: string): Promise<any[]> {
  const url = `https://www.dsebd.org/latest_share_price_alpha.php?letter=${encodeURIComponent(letter)}`
  
  const res = await undiciFetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    },
    dispatcher: insecureDispatcher,
  } as any)

  if (!res.ok) return []

  const html = await res.text()
  const $ = cheerio.load(html)
  const shares: any[] = []

  $("table tr").each((_i, element) => {
    const cols = $(element).find("td")
    if (cols.length >= 10) {
      const tradingCode = $(cols[1]).text().trim()

      if (tradingCode && tradingCode !== "TRADING CODE") {
        const parseNum = (val: string) => {
          const num = parseFloat(val.replace(/,/g, ""))
          return isNaN(num) ? 0 : num
        }

        shares.push({
          tradingCode,
          ltp: parseNum($(cols[2]).text().trim()),
          high: parseNum($(cols[3]).text().trim()),
          low: parseNum($(cols[4]).text().trim()),
          closeP: parseNum($(cols[5]).text().trim()),
          ycp: parseNum($(cols[6]).text().trim()),
          change: $(cols[7]).text().trim(),
          trade: parseNum($(cols[8]).text().trim()),
          value: parseNum($(cols[9]).text().trim()),
          volume: parseNum($(cols[10]).text().trim()),
        })
      }
    }
  })

  return shares
}

export async function GET() {
  try {
    // Fetch all letters in parallel (batched to be polite to the server)
    const BATCH_SIZE = 5
    const allShares: any[] = []

    for (let i = 0; i < LETTERS.length; i += BATCH_SIZE) {
      const batch = LETTERS.slice(i, i + BATCH_SIZE)
      const results = await Promise.all(batch.map(fetchSharesForLetter))
      results.forEach(shares => allShares.push(...shares))
    }

    // Deduplicate just in case
    const seen = new Set<string>()
    const uniqueShares = allShares.filter(s => {
      if (seen.has(s.tradingCode)) return false
      seen.add(s.tradingCode)
      return true
    })

    // Sort alphabetically
    uniqueShares.sort((a, b) => a.tradingCode.localeCompare(b.tradingCode))

    return NextResponse.json({ shares: uniqueShares })
  } catch (error) {
    console.error("DSE Scrape Error:", error)
    return NextResponse.json({ error: "Failed to fetch market data" }, { status: 500 })
  }
}
