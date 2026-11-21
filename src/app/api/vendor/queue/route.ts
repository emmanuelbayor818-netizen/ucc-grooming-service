import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

export async function POST(request: Request) {
  try {
    const { vendorId, customerCount, estimatedWaitMinutesPerPerson } = await request.json();

    if (!vendorId || customerCount === undefined) {
      return NextResponse.json(
        { error: "vendorId and customerCount are required" },
        { status: 400 }
      );
    }

    const count = Math.max(0, Number(customerCount));
    const waitTime = Number(estimatedWaitMinutesPerPerson) || 25;
    const now = new Date();

    const batch = adminDb.batch();

    // 1. Update queueUpdates collection
    const queueRef = adminDb.collection("queueUpdates").doc(vendorId);
    batch.set(queueRef, {
      vendorId,
      customerCount: count,
      estimatedWaitMinutesPerPerson: waitTime,
      updatedAt: now,
    });

    // 2. Synchronize currentQueueCount on vendor document for instant directory queries
    const vendorRef = adminDb.collection("vendors").doc(vendorId);
    batch.update(vendorRef, {
      currentQueueCount: count,
      updatedAt: now,
    });

    await batch.commit();

    return NextResponse.json({
      success: true,
      vendorId,
      customerCount: count,
      estimatedTotalWait: count * waitTime,
    });
  } catch (error: any) {
    console.error("Queue update error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update queue count" },
      { status: 500 }
    );
  }
}
