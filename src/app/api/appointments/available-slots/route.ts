import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { generateDailyTimeSlots, areTimeIntervalsOverlapping, calculateEndTime } from "@/lib/utils/time";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get("vendorId");
    const date = searchParams.get("date"); // YYYY-MM-DD
    const duration = Number(searchParams.get("duration") || 30);

    if (!vendorId || !date) {
      return NextResponse.json(
        { error: "vendorId and date (YYYY-MM-DD) are required" },
        { status: 400 }
      );
    }

    const targetDate = new Date(`${date}T00:00:00`);
    const dayOfWeek = targetDate.getDay(); // 0 = Sunday, 1 = Monday ...

    // Fetch vendor working hours for this day of week
    const hourDoc = await adminDb
      .collection("workingHours")
      .doc(`${vendorId}_${dayOfWeek}`)
      .get();

    let openingTime = "08:00";
    let closingTime = "20:00";
    let breakPeriods: { start: string; end: string }[] = [];
    let isWorkingDay = true;

    if (hourDoc.exists) {
      const data = hourDoc.data()!;
      isWorkingDay = data.isWorkingDay !== false;
      openingTime = data.openingTime || "08:00";
      closingTime = data.closingTime || "20:00";
      breakPeriods = data.breakPeriods || [];
    }

    if (!isWorkingDay) {
      return NextResponse.json({
        date,
        isWorkingDay: false,
        availableSlots: [],
        message: "Vendor is closed on this day.",
      });
    }

    // Generate potential slots based on interval (30 min increments)
    const allSlots = generateDailyTimeSlots(openingTime, closingTime, 30, breakPeriods);

    // Fetch existing active bookings for this vendor on this date
    const appointmentsSnap = await adminDb
      .collection("appointments")
      .where("vendorId", "==", vendorId)
      .where("appointmentDate", "==", date)
      .where("bookingStatus", "in", ["pending", "confirmed", "in_progress"])
      .get();

    const existingIntervals = appointmentsSnap.docs.map((doc: any) => {
      const d = doc.data();
      return { start: d.startTime, end: d.endTime };
    });

    // Filter available slots that accommodate the requested service duration
    const availableSlots = allSlots.filter((slot) => {
      const slotEnd = calculateEndTime(slot, duration);
      // Ensure slot doesn't exceed closing time
      const [closeH, closeM] = closingTime.split(":").map(Number);
      const [slotEndH, slotEndM] = slotEnd.split(":").map(Number);
      if (slotEndH * 60 + slotEndM > closeH * 60 + closeM) {
        return false;
      }

      // Check collision with existing bookings
      const hasConflict = existingIntervals.some((existing: any) =>
        areTimeIntervalsOverlapping(slot, slotEnd, existing.start, existing.end)
      );

      return !hasConflict;
    });

    return NextResponse.json({
      date,
      isWorkingDay: true,
      openingTime,
      closingTime,
      availableSlots,
    });
  } catch (error: any) {
    console.error("Error retrieving slots:", error);
    return NextResponse.json(
      { error: error.message || "Failed to retrieve available slots" },
      { status: 500 }
    );
  }
}
