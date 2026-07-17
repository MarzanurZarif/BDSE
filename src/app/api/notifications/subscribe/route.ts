import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const subscription = await req.json();

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });
    }

    // Check if subscription already exists for this endpoint
    const existing = await prisma.pushSubscription.findFirst({
      where: {
        userId: session.user.id,
        endpoint: subscription.endpoint,
      }
    });

    if (existing) {
      return NextResponse.json({ success: true, message: "Already subscribed" });
    }

    await prisma.pushSubscription.create({
      data: {
        userId: session.user.id,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      }
    });

    // Automatically enable web notifications for user
    await prisma.user.update({
      where: { id: session.user.id },
      data: { webNotificationsEnabled: true }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Push Subscription Error:", error);
    return NextResponse.json({ error: "Failed to save subscription" }, { status: 500 });
  }
}
