import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

export async function POST(request: Request) {
  try {
    const { appointmentId, customerId, customerName, vendorId, rating, comment, photos } = await request.json();

    if (!appointmentId || !customerId || !vendorId || !rating) {
      return NextResponse.json(
        { error: "appointmentId, customerId, vendorId, and rating (1-5) are required" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
    }

    // 1. Verify that appointment exists, is completed, and belongs to this customer
    const apptRef = adminDb.collection("appointments").doc(appointmentId);
    const apptDoc = await apptRef.get();

    if (!apptDoc.exists) {
      return NextResponse.json({ error: "Appointment does not exist" }, { status: 404 });
    }

    const appt = apptDoc.data()!;
    if (appt.customerId !== customerId) {
      return NextResponse.json({ error: "You can only review your own appointments" }, { status: 403 });
    }

    if (appt.bookingStatus !== "completed") {
      return NextResponse.json(
        { error: "Reviews are only allowed after an appointment is marked as completed" },
        { status: 400 }
      );
    }

    // 2. Prevent duplicate reviews for the same appointment
    const existingReview = await adminDb
      .collection("reviews")
      .where("appointmentId", "==", appointmentId)
      .limit(1)
      .get();

    if (!existingReview.empty) {
      return NextResponse.json(
        { error: "You have already submitted a review for this appointment" },
        { status: 400 }
      );
    }

    const now = new Date();
    const reviewRef = adminDb.collection("reviews").doc();
    const reviewId = reviewRef.id;

    await reviewRef.set({
      reviewId,
      appointmentId,
      customerId,
      customerName: customerName || "UCC Student",
      vendorId,
      rating: Number(rating),
      comment: comment || "",
      photos: photos || [],
      createdAt: now,
    });

    // 3. Atomically recalculate vendor rating & review count
    const vendorRef = adminDb.collection("vendors").doc(vendorId);
    await adminDb.runTransaction(async (transaction: any) => {
      const vDoc = await transaction.get(vendorRef);
      if (!vDoc.exists) return;

      const vData = vDoc.data()!;
      const currentCount = vData.reviewCount || 0;
      const currentRating = vData.rating || 5.0;

      const newCount = currentCount + 1;
      const newRating = Math.round(((currentRating * currentCount + Number(rating)) / newCount) * 10) / 10;

      transaction.update(vendorRef, {
        rating: newRating,
        reviewCount: newCount,
        updatedAt: now,
      });
    });

    return NextResponse.json({
      success: true,
      reviewId,
      message: "Review successfully posted.",
    });
  } catch (error: any) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { error: error.message || "Failed to submit review" },
      { status: 500 }
    );
  }
}
