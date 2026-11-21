import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { appointmentId, customerId, customerEmail, amount, vendorId } = body;

    if (!appointmentId || !customerId || !amount) {
      return NextResponse.json(
        { error: "appointmentId, customerId, and amount are required" },
        { status: 400 }
      );
    }

    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    const reference = `UCC_GROOM_${appointmentId}_${Date.now()}`;
    const amountInPesewas = Math.round(Number(amount) * 100);

    const now = new Date();
    const paymentRef = adminDb.collection("payments").doc();
    const paymentId = paymentRef.id;

    // Record initial pending payment in Firestore
    await paymentRef.set({
      paymentId,
      appointmentId,
      customerId,
      vendorId: vendorId || "",
      amount: Number(amount),
      currency: "GHS",
      paymentProvider: "paystack",
      transactionReference: reference,
      paymentStatus: "pending",
      createdAt: now,
    });

    // If live Paystack secret key is provided and not test placeholder, initialize with Paystack
    const isRealKey = paystackSecret && !paystackSecret.includes("sample");

    if (isRealKey) {
      const response = await fetch("https://api.paystack.co/transaction/initialize", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${paystackSecret}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: customerEmail || "student@ucc.edu.gh",
          amount: amountInPesewas,
          currency: "GHS",
          reference,
          channels: ["mobile_money", "card"],
          callback_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/customer/dashboard?paid=true&ref=${reference}`,
          metadata: {
            appointmentId,
            customerId,
            vendorId,
          },
        }),
      });

      const data = await response.json();
      if (!data.status) {
        throw new Error(data.message || "Paystack initialization failed");
      }

      return NextResponse.json({
        success: true,
        reference,
        authorizationUrl: data.data.authorization_url,
        accessCode: data.data.access_code,
      });
    }

    // In sandbox or emulator demo mode: return simulated checkout URL
    return NextResponse.json({
      success: true,
      reference,
      simulated: true,
      authorizationUrl: `/customer/payment-demo?ref=${reference}&amount=${amount}&appointmentId=${appointmentId}`,
    });
  } catch (error: any) {
    console.error("Payment initialization error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to initialize payment" },
      { status: 500 }
    );
  }
}
