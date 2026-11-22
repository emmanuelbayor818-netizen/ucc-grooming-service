export const dynamic = 'force-dynamic'
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customerId");

    if (!customerId) {
      return NextResponse.json({ error: "customerId is required" }, { status: 400 });
    }

    const appointmentsSnap = await adminDb
      .collection("appointments")
      .where("customerId", "==", customerId)
      .get();

    const appointments = appointmentsSnap.docs
      .map((doc: any) => ({
        appointmentId: doc.id,
        ...doc.data(),
      }))
      .sort((a: any, b: any) => {
        const dateCompare = (b.appointmentDate || "").localeCompare(a.appointmentDate || "");
        if (dateCompare !== 0) return dateCompare;
        return (b.startTime || "").localeCompare(a.startTime || "");
      });

    return NextResponse.json({ success: true, appointments });
  } catch (error: any) {
    console.error("Error fetching customer appointments:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch appointments" },
      { status: 500 }
    );
  }
}
