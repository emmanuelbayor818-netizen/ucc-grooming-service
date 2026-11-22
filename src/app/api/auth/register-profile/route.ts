export const dynamic = 'force-dynamic'
import { NextResponse } from "next/server";
import { adminDb, setUserRoleClaim } from "@/lib/firebase/admin";
import { UserProfile, Vendor } from "@/types";
import { UCC_COORDINATES } from "@/lib/constants/ucc";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, email, fullName, phoneNumber, role, vendorDetails } = body;

    if (!userId || !email || !fullName || !role) {
      return NextResponse.json(
        { error: "Missing required fields: userId, email, fullName, role" },
        { status: 400 }
      );
    }

    // Role validation
    const validRoles = ["customer", "vendor", "admin"];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: "Invalid role specified" }, { status: 400 });
    }

    // Assign Firebase Custom Claims for RBAC
    try {
      await setUserRoleClaim(userId, role);
    } catch (claimErr) {
      console.warn("Could not set custom user claims (emulator or permission):", claimErr);
    }

    const now = new Date();

    // Create user profile in Firestore
    const userDoc: UserProfile = {
      userId,
      fullName,
      email,
      phoneNumber: phoneNumber || "",
      role,
      accountStatus: "active",
      createdAt: now,
    };

    await adminDb.collection("users").doc(userId).set(userDoc);

    // If registering as a vendor, create the initial vendor business record
    if (role === "vendor") {
      const vendorId = userId; // 1:1 mapping for primary vendor record
      const vendorRecord: Partial<Vendor> = {
        vendorId,
        ownerId: userId,
        shopName: vendorDetails?.shopName || `${fullName}'s Grooming Hub`,
        description: "Premier grooming & haircut services on the UCC campus.",
        categories: vendorDetails?.categories?.length ? vendorDetails.categories : ["barbering"],
        phoneNumber: phoneNumber || "",
        whatsappNumber: phoneNumber || "",
        profileImage: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=600&q=80",
        businessAddress: vendorDetails?.businessAddress || "UCC Campus, Science Market, Cape Coast",
        region: "Central Region",
        town: "Cape Coast",
        area: (vendorDetails?.area as any) || "Science",
        latitude: UCC_COORDINATES.lat,
        longitude: UCC_COORDINATES.lng,
        verificationStatus: "pending",
        shopStatus: "open",
        availabilityStatus: "accepting_bookings",
        rating: 5.0,
        reviewCount: 0,
        currentQueueCount: 0,
        createdAt: now,
        updatedAt: now,
      };

      await adminDb.collection("vendors").doc(vendorId).set(vendorRecord);

      // Initialize default working hours for the vendor (Monday to Saturday)
      const batch = adminDb.batch();
      const days = [
        { day: 1, name: "Monday" },
        { day: 2, name: "Tuesday" },
        { day: 3, name: "Wednesday" },
        { day: 4, name: "Thursday" },
        { day: 5, name: "Friday" },
        { day: 6, name: "Saturday" },
        { day: 0, name: "Sunday" },
      ];

      for (const d of days) {
        const hourDocRef = adminDb.collection("workingHours").doc(`${vendorId}_${d.day}`);
        batch.set(hourDocRef, {
          vendorId,
          day: d.day,
          dayName: d.name,
          openingTime: "08:00",
          closingTime: "20:00",
          breakPeriods: [{ start: "13:00", end: "14:00", label: "Lunch Break" }],
          isWorkingDay: d.day !== 0, // Sunday off by default
        });
      }

      // Initialize default live queue record
      const queueDocRef = adminDb.collection("queueUpdates").doc(vendorId);
      batch.set(queueDocRef, {
        vendorId,
        customerCount: 0,
        estimatedWaitMinutesPerPerson: 25,
        updatedAt: now,
      });

      // Initialize standard default services for quick start
      const defaultServiceId = `${vendorId}_srv_1`;
      const srvRef = adminDb.collection("services").doc(defaultServiceId);
      batch.set(srvRef, {
        serviceId: defaultServiceId,
        vendorId,
        serviceName: "Standard Campus Fade & Lineup",
        description: "Clean taper or low fade, precision hairline shaping, and beard trim.",
        price: 35,
        pricingType: "fixed",
        duration: 30,
        imageUrl: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=600&q=80",
        isAvailable: true,
        category: "barbering",
        createdAt: now,
        updatedAt: now,
      });

      await batch.commit();
    }

    // Create a welcome notification for the user
    await adminDb.collection("notifications").add({
      recipientId: userId,
      title: "Welcome to UCC Grooming Service!",
      message: role === "vendor" 
        ? "Your vendor registration is submitted. You can now setup your service catalog while verification is reviewed."
        : "Welcome to UCC's premier grooming platform. Discover top barbers and salons on campus and book your slots.",
      notificationType: "system",
      isRead: false,
      createdAt: now,
    });

    return NextResponse.json({ success: true, userId, role });
  } catch (error: any) {
    console.error("Error registering user profile:", error);
    return NextResponse.json(
      { error: error.message || "Failed to register profile" },
      { status: 500 }
    );
  }
}
