export const dynamic = 'force-dynamic'
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { areTimeIntervalsOverlapping, calculateEndTime } from "@/lib/utils/time";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      customerId,
      customerName,
      customerPhone,
      vendorId,
      serviceId,
      appointmentDate, // "YYYY-MM-DD"
      startTime,       // "HH:mm"
      paymentMethod,   // 'paystack_momo' | 'paystack_card' | 'pay_at_shop'
      customerNotes,
    } = body;

    if (!customerId || !vendorId || !serviceId || !appointmentDate || !startTime) {
      return NextResponse.json(
        { error: "Missing required booking details (customerId, vendorId, serviceId, date, time)" },
        { status: 400 }
      );
    }

    // 1. Fetch Service Details
    const serviceDoc = await adminDb.collection("services").doc(serviceId).get();
    if (!serviceDoc.exists) {
      return NextResponse.json({ error: "Selected service does not exist" }, { status: 404 });
    }
    const serviceData = serviceDoc.data()!;
    const serviceDuration = Number(serviceData.duration) || 30;
    const agreedPrice = Number(serviceData.price) || 0;
    const serviceNameSnapshot = serviceData.serviceName || "Grooming Service";
    const endTime = calculateEndTime(startTime, serviceDuration);

    // 2. Fetch Vendor Details
    const vendorDoc = await adminDb.collection("vendors").doc(vendorId).get();
    if (!vendorDoc.exists) {
      return NextResponse.json({ error: "Vendor does not exist" }, { status: 404 });
    }
    const vendorData = vendorDoc.data()!;

    // 3. Prevent Double Booking via Atomic Firestore Transaction
    const appointmentRef = adminDb.collection("appointments").doc();
    const appointmentId = appointmentRef.id;

    const result = await adminDb.runTransaction(async (transaction: any) => {
      // Query existing active bookings for this vendor on this specific date
      const existingQuery = adminDb
        .collection("appointments")
        .where("vendorId", "==", vendorId)
        .where("appointmentDate", "==", appointmentDate)
        .where("bookingStatus", "in", ["pending", "confirmed", "in_progress"]);

      const querySnapshot = await transaction.get(existingQuery);

      // Check if any existing booking overlaps with requested slot
      for (const doc of querySnapshot.docs) {
        const existing = doc.data();
        if (
          areTimeIntervalsOverlapping(
            startTime,
            endTime,
            existing.startTime,
            existing.endTime
          )
        ) {
          throw new Error(
            `SLOT_OCCUPIED: The slot ${startTime} - ${endTime} is already reserved by another customer.`
          );
        }
      }

      const now = new Date();
      const initialPaymentStatus = paymentMethod === "pay_at_shop" ? "unpaid" : "pending";
      const initialBookingStatus = paymentMethod === "pay_at_shop" ? "confirmed" : "pending";

      const newAppointment = {
        appointmentId,
        customerId,
        customerName: customerName || "UCC Student",
        customerPhone: customerPhone || "",
        vendorId,
        vendorName: vendorData.shopName || "Grooming Studio",
        serviceId,
        serviceNameSnapshot,
        agreedPrice,
        serviceDuration,
        appointmentDate,
        startTime,
        endTime,
        bookingStatus: initialBookingStatus,
        paymentMethod: paymentMethod || "pay_at_shop",
        paymentStatus: initialPaymentStatus,
        customerNotes: customerNotes || "",
        createdAt: now,
        updatedAt: now,
      };

      transaction.set(appointmentRef, newAppointment);

      // Notify vendor
      const notifRef = adminDb.collection("notifications").doc();
      transaction.set(notifRef, {
        notificationId: notifRef.id,
        recipientId: vendorData.ownerId || vendorId,
        title: "New Appointment Booked",
        message: `${customerName || "A student"} booked ${serviceNameSnapshot} on ${appointmentDate} at ${startTime}.`,
        notificationType: "booking_request",
        actionUrl: `/vendor/bookings`,
        isRead: false,
        createdAt: now,
      });

      return newAppointment;
    });

    return NextResponse.json({
      success: true,
      appointment: result,
      message: "Appointment successfully reserved.",
    });
  } catch (error: any) {
    console.error("Booking error:", error);
    if (error.message?.includes("SLOT_OCCUPIED")) {
      return NextResponse.json(
        { error: error.message, code: "SLOT_OCCUPIED" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Failed to create appointment" },
      { status: 500 }
    );
  }
}
