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
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { emailNotificationsEnabled: true }
    })
    
    return NextResponse.json({ user })
  } catch (error) {
    console.error("User GET Error:", error)
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const data = await req.json()
    const { emailNotificationsEnabled } = data

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        emailNotificationsEnabled: !!emailNotificationsEnabled
      }
    })

    return NextResponse.json({ user })
  } catch (error) {
    console.error("User PUT Error:", error)
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}
