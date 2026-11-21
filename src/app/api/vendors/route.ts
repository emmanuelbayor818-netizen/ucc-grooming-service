import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const area = searchParams.get("area");
    const category = searchParams.get("category");

    let query: any = adminDb.collection("vendors");

    if (area && area !== "All") {
      query = query.where("area", "==", area);
    }

    const snap = await query.get();
    let vendors = snap.docs.map((doc: any) => ({
      vendorId: doc.id,
      ...doc.data(),
    })) as any[];

    if (category && category !== "All") {
      vendors = vendors.filter(
        (v) => Array.isArray(v.categories) && v.categories.includes(category)
      );
    }

    return NextResponse.json({ success: true, count: vendors.length, vendors });
  } catch (error: any) {
    console.error("Error fetching vendors:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch vendors" },
      { status: 500 }
    );
  }
}
