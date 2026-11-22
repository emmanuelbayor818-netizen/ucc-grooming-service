export const dynamic = 'force-dynamic'
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

export async function POST(request: Request) {
  try {
    const { reportId, status, resolutionNotes, adminId } = await request.json();

    if (!reportId || !status) {
      return NextResponse.json({ error: "reportId and status are required" }, { status: 400 });
    }

    const reportRef = adminDb.collection("reports").doc(reportId);
    const snap = await reportRef.get();
    if (!snap.exists) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    const now = new Date();
    await reportRef.update({
      status,
      resolutionNotes: resolutionNotes || "",
      resolvedBy: adminId || "system_admin",
      resolvedAt: now,
    });

    await adminDb.collection("adminLogs").add({
      administratorId: adminId || "system_admin",
      action: "report_resolved",
      targetId: reportId,
      metadata: { status, resolutionNotes },
      timestamp: now,
    });

    return NextResponse.json({ success: true, reportId, status });
  } catch (error: any) {
    console.error("Report management error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update report" },
      { status: 500 }
    );
  }
}
