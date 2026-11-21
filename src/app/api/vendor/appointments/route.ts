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
      .orderBy("appointmentDate", "desc")
      .limit(50)
      .get();

    const appointments = snap.docs.map((doc: any) => ({
      appointmentId: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ success: true, appointments });
  } catch (error: any) {
    console.error("Error fetching vendor appointments:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch appointments" },
      { status: 500 }
    );
  }
}
