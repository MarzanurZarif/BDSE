import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const data = await req.json()
    const { boughtPrice, quantity, notifyPrice } = data
    const resolvedParams = await params

    // Verify ownership
    const existing = await prisma.portfolioItem.findUnique({ where: { id: resolvedParams.id } })
    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 })
    }

    const item = await prisma.portfolioItem.update({
      where: { id: resolvedParams.id },
      data: {
        boughtPrice: boughtPrice ?? existing.boughtPrice,
        quantity: quantity ?? existing.quantity,
        notifyPrice: notifyPrice !== undefined ? notifyPrice : existing.notifyPrice
      }
    })

    return NextResponse.json({ item })
  } catch (error) {
    console.error("Portfolio PUT Error:", error)
    return NextResponse.json({ error: "Failed to update portfolio item" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const resolvedParams = await params
    // Verify ownership
    const existing = await prisma.portfolioItem.findUnique({ where: { id: resolvedParams.id } })
    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 })
    }

    await prisma.portfolioItem.delete({
      where: { id: resolvedParams.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Portfolio DELETE Error:", error)
    return NextResponse.json({ error: "Failed to delete portfolio item" }, { status: 500 })
  }
}
