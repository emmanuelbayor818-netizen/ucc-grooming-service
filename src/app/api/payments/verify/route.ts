export const dynamic = 'force-dynamic'
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

export async function POST(request: Request) {
  try {
    const { reference, appointmentId } = await request.json();

    if (!reference) {
      return NextResponse.json({ error: "Transaction reference is required" }, { status: 400 });
    }

    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    const isRealKey = paystackSecret && !paystackSecret.includes("sample");

    let isSuccess = false;
    let channel = "mobile_money";

    if (isRealKey) {
      const res = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
        headers: { Authorization: `Bearer ${paystackSecret}` },
      });
      const data = await res.json();
      if (data.status && data.data.status === "success") {
        isSuccess = true;
        channel = data.data.channel || "mobile_money";
      }
    } else {
      // In development/test mode, simulate verified payment
      isSuccess = true;
    }

    if (!isSuccess) {
      return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
    }

    const now = new Date();

    // Find and update payment document in Firestore
    const paymentsSnap = await adminDb
      .collection("payments")
      .where("transactionReference", "==", reference)
      .limit(1)
      .get();

    let targetApptId = appointmentId;

    if (!paymentsSnap.empty) {
      const pDoc = paymentsSnap.docs[0];
      targetApptId = targetApptId || pDoc.data().appointmentId;
      await pDoc.ref.update({
        paymentStatus: "success",
        channel,
        paidAt: now,
      });
    }

    // Update appointment paymentStatus to 'paid' and bookingStatus to 'confirmed'
    if (targetApptId) {
      const apptRef = adminDb.collection("appointments").doc(targetApptId);
      const apptDoc = await apptRef.get();
      if (apptDoc.exists) {
        await apptRef.update({
          paymentStatus: "paid",
          bookingStatus: "confirmed",
          updatedAt: now,
        });

        // Notify vendor of confirmed payment
        const appt = apptDoc.data()!;
        await adminDb.collection("notifications").add({
          recipientId: appt.vendorId,
          title: "Payment Received",
          message: `Payment of GH₵ ${appt.agreedPrice} confirmed for appointment on ${appt.appointmentDate}.`,
          notificationType: "payment_success",
          actionUrl: `/vendor/bookings`,
          isRead: false,
          createdAt: now,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Payment successfully verified and appointment confirmed.",
    });
  } catch (error: any) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to verify payment" },
      { status: 500 }
    );
  }
}
