import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: vendorId } = await params;

    if (!vendorId) {
      return NextResponse.json({ error: "vendorId is required" }, { status: 400 });
    }

    // 1. Fetch vendor profile
    const vDoc = await adminDb.collection("vendors").doc(vendorId).get();
    if (!vDoc.exists) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    const vendor = { vendorId: vDoc.id, ...vDoc.data() };

    // 2. Fetch active services for this vendor
    const servicesSnap = await adminDb
      .collection("services")
      .where("vendorId", "==", vendorId)
      .where("isAvailable", "==", true)
      .get();

    const services = servicesSnap.docs.map((doc: any) => ({
      serviceId: doc.id,
      ...doc.data(),
    }));

    // 3. Fetch reviews for this vendor
    const reviewsSnap = await adminDb
      .collection("reviews")
      .where("vendorId", "==", vendorId)
      .orderBy("createdAt", "desc")
      .limit(20)
      .get();

    const reviews = reviewsSnap.docs.map((doc: any) => ({
      reviewId: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({
      success: true,
      vendor,
      services,
      reviews,
    });
  } catch (error: any) {
    console.error("Error fetching vendor details:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch vendor" },
      { status: 500 }
    );
  }
}
