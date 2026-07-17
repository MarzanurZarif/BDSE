import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

import { Agent, fetch as undiciFetch } from "undici"

export const dynamic = "force-dynamic"

const insecureDispatcher = new Agent({
  connect: { rejectUnauthorized: false },
})

export async function GET() {
  try {
    const response = await undiciFetch("https://www.dsebd.org/ajax/load-news.php", {
    method: "POST", // Change method to POST
    dispatcher: insecureDispatcher,
    headers: {
        "X-Requested-With": "XMLHttpRequest",
        "Content-Type": "application/x-www-form-urlencoded", // This is crucial for form data
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html, */*; q=0.01"
    },
    body: new URLSearchParams({
        "criteria": "2", 
    })
});
    const html = await response.text();
    const $ = cheerio.load(html);
        
    const news: any[] = [];

    $('.table-news').each((i, table) => {      
        const rows = $(table).find('tr');
        
        if (rows.length > 0) {
            rows.each((j, row) => {
                const th = $(row).find('th').first();
                
                if (th.text().trim() === 'Trading Code:') {
                    const tradingCode = $(row).find('td').first().text().trim();
                    
                    const newsTitle = $(rows[j+1]).find('td').first().text().trim();
                    const content = $(rows[j+2]).find('td').first().text().trim();
                    const dateStr = $(rows[j+3]).find('td').first().text().trim();
                    const url = "https://www.dsebd.org/news_archive_7days.php";
                                        
                    if (tradingCode && content) {
                        news.push({
                            id: `${tradingCode}-${dateStr}-${j}`,
                            tradingCode,
                            date: dateStr,
                            title: newsTitle,
                            content,
                            url
                        });
                    }
                }
            });
        }
    });

    return NextResponse.json({ news });
  } catch (error) {
    console.error("News scrape error:", error);
    return NextResponse.json({ error: "Failed to fetch news" }, { status: 500 });
  }
}
