export const dynamic = 'force-dynamic'
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

export async function POST(request: Request) {
  try {
    const { adminId, vendorId, action, reason } = await request.json();

    if (!vendorId || !action) {
      return NextResponse.json({ error: "vendorId and action are required" }, { status: 400 });
    }

    const validActions = ["verify", "suspend", "reject", "reopen"];
    if (!validActions.includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const vendorRef = adminDb.collection("vendors").doc(vendorId);
    const vSnap = await vendorRef.get();
    if (!vSnap.exists) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    const vData = vSnap.data()!;
    const now = new Date();
    let newStatus = vData.verificationStatus;

    if (action === "verify") newStatus = "verified";
    if (action === "suspend") newStatus = "suspended";
    if (action === "reject") newStatus = "rejected";
    if (action === "reopen") newStatus = "verified";

    await vendorRef.update({
      verificationStatus: newStatus,
      updatedAt: now,
    });

    // Write audit log to adminLogs
    await adminDb.collection("adminLogs").add({
      logId: adminDb.collection("adminLogs").doc().id,
      administratorId: adminId || "system_admin",
      action: `vendor_${action}`,
      targetId: vendorId,
      metadata: { previousStatus: vData.verificationStatus, newStatus, reason: reason || "" },
      timestamp: now,
    });

    // Notify the vendor owner
    await adminDb.collection("notifications").add({
      recipientId: vData.ownerId,
      title: `Vendor Application: ${newStatus.toUpperCase()}`,
      message: action === "verify"
        ? "Congratulations! Your UCC Grooming shop is officially verified and visible to students."
        : `Your shop status has been updated to ${newStatus}. Reason: ${reason || "Policy compliance update."}`,
      notificationType: "system",
      actionUrl: `/vendor/dashboard`,
      isRead: false,
      createdAt: now,
    });

    return NextResponse.json({ success: true, vendorId, verificationStatus: newStatus });
  } catch (error: any) {
    console.error("Admin vendor action error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update vendor" },
      { status: 500 }
    );
  }
}
