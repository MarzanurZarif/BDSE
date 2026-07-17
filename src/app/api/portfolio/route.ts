import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const portfolio = await prisma.portfolioItem.findMany({
      where: { userId: session.user.id },
      orderBy: { tradingCode: 'asc' }
    })
    
    return NextResponse.json({ portfolio })
  } catch (error) {
    console.error("Portfolio GET Error:", error)
    return NextResponse.json({ error: "Failed to fetch portfolio" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const data = await req.json()
    const { tradingCode, boughtPrice, quantity, notifyPrice } = data

    if (!tradingCode || typeof boughtPrice !== 'number' || typeof quantity !== 'number') {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 })
    }

    const item = await prisma.portfolioItem.create({
      data: {
        userId: session.user.id,
        tradingCode,
        boughtPrice,
        quantity,
        notifyPrice: notifyPrice || null
      }
    })

    return NextResponse.json({ item })
  } catch (error) {
    console.error("Portfolio POST Error:", error)
    return NextResponse.json({ error: "Failed to create portfolio item" }, { status: 500 })
  }
}
