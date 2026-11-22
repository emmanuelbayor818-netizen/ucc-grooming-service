export const dynamic = 'force-dynamic'
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const email = searchParams.get("email");

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const userDoc = await adminDb.collection("users").doc(userId).get();
    if (userDoc.exists) {
      return NextResponse.json({ success: true, profile: userDoc.data() });
    }

    // Default auto profile if user exists in Firebase Auth but profile hasn't been written
    let detectedRole = "customer";
    if (email?.includes("admin") || email === "admin@ucc.edu.gh") {
      detectedRole = "admin";
    } else if (email?.includes("vendor") || email === "bbf@ucc.edu.gh") {
      detectedRole = "vendor";
    }

    const autoProfile = {
      userId,
      email: email || "",
      fullName: email ? email.split("@")[0] : "UCC Student",
      phoneNumber: "",
      role: detectedRole,
      accountStatus: "active",
      createdAt: new Date(),
    };

    await adminDb.collection("users").doc(userId).set(autoProfile);

    return NextResponse.json({ success: true, profile: autoProfile });
  } catch (err: any) {
    console.error("Profile API error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to load user profile" },
      { status: 500 }
    );
  }
}
