export const dynamic = 'force-dynamic'
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { REAL_UCC_VENDORS, REAL_UCC_SERVICES } from "@/lib/constants/realVendors";

export async function POST() {
  try {
    const now = new Date();

    // 1. Clean old
    const oldVendors = await adminDb.collection("vendors").get();
    for (const doc of oldVendors.docs) {
      await doc.ref.delete();
    }
    const oldServices = await adminDb.collection("services").get();
    for (const doc of oldServices.docs) {
      await doc.ref.delete();
    }
    const oldHours = await adminDb.collection("workingHours").get();
    for (const doc of oldHours.docs) {
      await doc.ref.delete();
    }
    const oldQueues = await adminDb.collection("queueUpdates").get();
    for (const doc of oldQueues.docs) {
      await doc.ref.delete();
    }

    // 2. Batch write 7 authentic UCC vendors
    const batch1 = adminDb.batch();
    for (const v of REAL_UCC_VENDORS) {
      if (!v.vendorId) continue;
      batch1.set(adminDb.collection("vendors").doc(v.vendorId), {
        ...v,
        createdAt: now,
        updatedAt: now,
      });

      batch1.set(adminDb.collection("queueUpdates").doc(v.vendorId), {
        vendorId: v.vendorId,
        customerCount: v.currentQueueCount ?? 0,
        estimatedWaitMinutesPerPerson: 25,
        updatedAt: now,
      });

      let openH = "08:00";
      let closeH = "22:00";
      if (v.vendorId === "ucc_vend_classic_cuts") {
        openH = "10:00";
        closeH = "22:00";
      } else if (v.vendorId === "ucc_vend_gods_time") {
        openH = "07:30";
        closeH = "20:00";
      } else if (v.vendorId === "ucc_vend_graduate_barber") {
        openH = "08:30";
        closeH = "21:30";
      } else if (v.vendorId === "ucc_vend_magdee_beauty") {
        openH = "00:00";
        closeH = "23:59";
      }

      for (let day = 0; day <= 6; day++) {
        let isWorking = true;
        if (v.vendorId === "ucc_vend_beauty_by_deborah") {
          isWorking = [0, 5, 6].includes(day);
        } else if (v.vendorId === "ucc_vend_classic_cuts") {
          isWorking = day !== 0;
        }

        batch1.set(adminDb.collection("workingHours").doc(`${v.vendorId}_${day}`), {
          vendorId: v.vendorId,
          day,
          dayName: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][day],
          openingTime: openH,
          closingTime: closeH,
          breakPeriods: [{ start: "13:00", end: "14:00", label: "Break" }],
          isWorkingDay: isWorking,
        });
      }
    }
    await batch1.commit();

    // 3. Batch write 55 services
    const batch2 = adminDb.batch();
    for (const s of REAL_UCC_SERVICES) {
      if (!s.serviceId) continue;
      batch2.set(adminDb.collection("services").doc(s.serviceId), {
        ...s,
        createdAt: now,
        updatedAt: now,
      });
    }
    await batch2.commit();

    return NextResponse.json({
      success: true,
      message: `Successfully seeded ${REAL_UCC_VENDORS.length} real UCC Vendors and ${REAL_UCC_SERVICES.length} authentic services into Cloud Firestore.`,
      vendorsCount: REAL_UCC_VENDORS.length,
      servicesCount: REAL_UCC_SERVICES.length,
    });
  } catch (error: any) {
    console.error("Seeding error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to seed database" },
      { status: 500 }
    );
  }
}
