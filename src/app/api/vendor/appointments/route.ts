import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get("vendorId");

    if (!vendorId) {
      return NextResponse.json({ error: "vendorId is required" }, { status: 400 });
    }

    const snap = await adminDb
      .collection("appointments")
      .where("vendorId", "==", vendorId)
      .get();

    const appointments = snap.docs
      .map((doc: any) => ({
        appointmentId: doc.id,
        ...doc.data(),
      }))
      .sort((a: any, b: any) => {
        const dateCompare = (b.appointmentDate || "").localeCompare(a.appointmentDate || "");
        if (dateCompare !== 0) return dateCompare;
        return (b.startTime || "").localeCompare(a.startTime || "");
      })
      .slice(0, 50);

    return NextResponse.json({ success: true, appointments });
  } catch (error: any) {
    console.error("Error fetching vendor appointments:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch appointments" },
      { status: 500 }
    );
  }
}
