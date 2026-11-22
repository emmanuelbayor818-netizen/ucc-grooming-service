export const dynamic = 'force-dynamic'
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

export async function POST(request: Request) {
  try {
    const { vendorId, serviceName, description, price, duration, isAvailable } = await request.json();

    if (!vendorId || !serviceName || price === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const serviceRef = adminDb.collection("services").doc();
    const serviceId = serviceRef.id;
    const now = new Date();

    const newService = {
      serviceId,
      vendorId,
      serviceName,
      description: description || "",
      price: Number(price),
      pricingType: "fixed",
      duration: Number(duration) || 30,
      isAvailable: isAvailable !== false,
      createdAt: now,
      updatedAt: now,
    };

    await serviceRef.set(newService);

    return NextResponse.json({ success: true, service: newService });
  } catch (error: any) {
    console.error("Error creating service:", error);
    return NextResponse.json({ error: error.message || "Failed to create service" }, { status: 500 });
  }
}
