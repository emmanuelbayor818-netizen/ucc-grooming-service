import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { BookingStatus } from "@/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { appointmentId, newStatus, reason, updatedBy } = body;

    if (!appointmentId || !newStatus) {
      return NextResponse.json(
        { error: "appointmentId and newStatus are required" },
        { status: 400 }
      );
    }

    const validStatuses: BookingStatus[] = [
      "pending",
      "confirmed",
      "in_progress",
      "completed",
      "cancelled",
      "rejected",
    ];

    if (!validStatuses.includes(newStatus)) {
      return NextResponse.json({ error: "Invalid booking status" }, { status: 400 });
    }

    const apptRef = adminDb.collection("appointments").doc(appointmentId);
    const snap = await apptRef.get();
    if (!snap.exists) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    const appointment = snap.data()!;
    const now = new Date();

    const updatePayload: Record<string, any> = {
      bookingStatus: newStatus,
      updatedAt: now,
    };

    if (reason) {
      updatePayload.cancellationReason = reason;
    }

    // If marked completed, mark payment as paid if paymentMethod was pay_at_shop
    if (newStatus === "completed" && appointment.paymentMethod === "pay_at_shop") {
      updatePayload.paymentStatus = "paid";
    }

    await apptRef.update(updatePayload);

    // Notify Customer about status change
    let message = `Your appointment for ${appointment.serviceNameSnapshot} on ${appointment.appointmentDate} is now ${newStatus.replace('_', ' ')}.`;
    if (newStatus === "completed") {
      message = `Your grooming session is completed! You can now rate your experience and write a verified review.`;
    }

    await adminDb.collection("notifications").add({
      recipientId: appointment.customerId,
      title: `Booking Update: ${newStatus.toUpperCase()}`,
      message,
      notificationType: newStatus === "completed" ? "system" : "booking_confirmed",
      actionUrl: `/customer/dashboard`,
      isRead: false,
      createdAt: now,
    });

    return NextResponse.json({ success: true, appointmentId, newStatus });
  } catch (error: any) {
    console.error("Status update error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update appointment status" },
      { status: 500 }
    );
  }
}
