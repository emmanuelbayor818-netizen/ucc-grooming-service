import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { CAMPUS_HOTSPOTS } from "@/lib/constants/ucc";

export async function POST() {
  try {
    const now = new Date();
    const batch = adminDb.batch();

    const sampleVendors = [
      {
        vendorId: "ucc_vend_casford_cutz",
        ownerId: "owner_casford_1",
        shopName: "Casford Royal Barbershop",
        description: "UCC's legendary hall barbershop. Known for precision fades, temple tapers, beard sculpts and hot towel shaves for gentlemen.",
        categories: ["barbering", "grooming_package"],
        phoneNumber: "+233 24 412 3456",
        whatsappNumber: "+233 24 412 3456",
        profileImage: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=700&q=80",
        gallery: [
          "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=600&q=80",
          "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=600&q=80",
        ],
        businessAddress: "Casely Hayford Hall, Ground Floor Arcade, UCC",
        region: "Central Region",
        town: "Cape Coast",
        area: "Valco / Casford",
        latitude: 5.1215,
        longitude: -1.2858,
        verificationStatus: "verified",
        shopStatus: "open",
        availabilityStatus: "accepting_bookings",
        currentQueueCount: 3,
        rating: 4.9,
        reviewCount: 48,
        createdAt: now,
        updatedAt: now,
      },
      {
        vendorId: "ucc_vend_science_glam",
        ownerId: "owner_science_2",
        shopName: "Science Hub Salon & Braids",
        description: "Specializing in knotless braids, bohemian box braids, wig revamp, frontal installations and gentle scalp treatments.",
        categories: ["braiding", "hair_styling", "locs"],
        phoneNumber: "+233 50 789 0123",
        whatsappNumber: "+233 50 789 0123",
        profileImage: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=700&q=80",
        gallery: [
          "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80",
          "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=600&q=80",
        ],
        businessAddress: "Science Market Plaza, Shop 14, Old Site, UCC",
        region: "Central Region",
        town: "Cape Coast",
        area: "Science",
        latitude: 5.1172,
        longitude: -1.2875,
        verificationStatus: "verified",
        shopStatus: "open",
        availabilityStatus: "accepting_bookings",
        currentQueueCount: 2,
        rating: 4.8,
        reviewCount: 36,
        createdAt: now,
        updatedAt: now,
      },
      {
        vendorId: "ucc_vend_amamoma_executive",
        ownerId: "owner_amamoma_3",
        shopName: "Amamoma Executive Grooming Studio",
        description: "High-end student grooming parlour with air-conditioned lounge, PS5 gaming while you wait, dreadlock styling, manicure and pedicure.",
        categories: ["barbering", "locs", "nails", "spa_facial"],
        phoneNumber: "+233 55 987 6543",
        whatsappNumber: "+233 55 987 6543",
        profileImage: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=700&q=80",
        gallery: [
          "https://images.unsplash.com/photo-1512690459411-b9245aed614b?auto=format&fit=crop&w=600&q=80",
        ],
        businessAddress: "Amamoma High Street, Opposite Adisadel Hostel, Cape Coast",
        region: "Central Region",
        town: "Cape Coast",
        area: "Amamoma",
        latitude: 5.1265,
        longitude: -1.2910,
        verificationStatus: "verified",
        shopStatus: "open",
        availabilityStatus: "accepting_bookings",
        currentQueueCount: 4,
        rating: 4.9,
        reviewCount: 52,
        createdAt: now,
        updatedAt: now,
      },
      {
        vendorId: "ucc_vend_atl_elegance",
        ownerId: "owner_atl_4",
        shopName: "ATL Oceanic Spa & Nails Bar",
        description: "Relaxing manicures, nail tips, eyebrow microblading, soothing facial cleanses, and matriculation glam packages.",
        categories: ["nails", "spa_facial", "grooming_package"],
        phoneNumber: "+233 20 112 2334",
        whatsappNumber: "+233 20 112 2334",
        profileImage: "https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=700&q=80",
        gallery: [
          "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=600&q=80",
        ],
        businessAddress: "Atlantic Hall Annex, Ground Floor, UCC Beachfront",
        region: "Central Region",
        town: "Cape Coast",
        area: "Oguaa / ATL",
        latitude: 5.1098,
        longitude: -1.2895,
        verificationStatus: "verified",
        shopStatus: "open",
        availabilityStatus: "accepting_bookings",
        currentQueueCount: 1,
        rating: 4.7,
        reviewCount: 29,
        createdAt: now,
        updatedAt: now,
      }
    ];

    // Sample services mapped to vendors
    const sampleServices = [
      // Casford Cutz
      {
        serviceId: "srv_casford_1",
        vendorId: "ucc_vend_casford_cutz",
        serviceName: "Signature Casford Low Fade & Beard Trim",
        description: "Detailed skin fade, razor sharp hairline, hot towel beard nourishment.",
        price: 35,
        pricingType: "fixed",
        duration: 30,
        imageUrl: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=500&q=80",
        isAvailable: true,
        category: "barbering",
      },
      {
        serviceId: "srv_casford_2",
        vendorId: "ucc_vend_casford_cutz",
        serviceName: "Executive Grooming & Hair Coloring (Black/Gold)",
        description: "Precision haircut, organic dye treatment, and beard wash.",
        price: 55,
        pricingType: "fixed",
        duration: 45,
        imageUrl: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=500&q=80",
        isAvailable: true,
        category: "barbering",
      },
      // Science Glam
      {
        serviceId: "srv_science_1",
        vendorId: "ucc_vend_science_glam",
        serviceName: "Knotless Box Braids (Medium Length)",
        description: "Pain-free, neat parting, natural look with high quality hair extensions included.",
        price: 130,
        pricingType: "fixed",
        duration: 90,
        imageUrl: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=500&q=80",
        isAvailable: true,
        category: "braiding",
      },
      {
        serviceId: "srv_science_2",
        vendorId: "ucc_vend_science_glam",
        serviceName: "Wig Revamp & Frontal Installation",
        description: "Deep conditioning wash, bleached knots, customized plucked hairline, and styling.",
        price: 90,
        pricingType: "fixed",
        duration: 60,
        imageUrl: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=500&q=80",
        isAvailable: true,
        category: "hair_styling",
      },
      // Amamoma Executive
      {
        serviceId: "srv_amamoma_1",
        vendorId: "ucc_vend_amamoma_executive",
        serviceName: "Dreadlocks Retwist & Scalp Interlocking",
        description: "Clarifying herbal wash, tea tree scalp massage, and firm organic retwist.",
        price: 80,
        pricingType: "fixed",
        duration: 60,
        imageUrl: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=500&q=80",
        isAvailable: true,
        category: "locs",
      },
      // ATL Spa
      {
        serviceId: "srv_atl_1",
        vendorId: "ucc_vend_atl_elegance",
        serviceName: "Acrylic Nails Full Set & Gel Polish",
        description: "Nail sculpting, cuticle grooming, custom nail art, and long-lasting gel topcoat.",
        price: 75,
        pricingType: "fixed",
        duration: 45,
        imageUrl: "https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=500&q=80",
        isAvailable: true,
        category: "nails",
      }
    ];

    // Seed Vendors & Queue & Working Hours
    for (const v of sampleVendors) {
      batch.set(adminDb.collection("vendors").doc(v.vendorId), v);

      // Queue state
      batch.set(adminDb.collection("queueUpdates").doc(v.vendorId), {
        vendorId: v.vendorId,
        customerCount: v.currentQueueCount,
        estimatedWaitMinutesPerPerson: 25,
        updatedAt: now,
      });

      // Default Working Hours
      for (let day = 0; day <= 6; day++) {
        batch.set(adminDb.collection("workingHours").doc(`${v.vendorId}_${day}`), {
          vendorId: v.vendorId,
          day,
          dayName: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][day],
          openingTime: "08:00",
          closingTime: "21:00",
          breakPeriods: [{ start: "13:00", end: "14:00", label: "Lunch" }],
          isWorkingDay: day !== 0,
        });
      }
    }

    // Seed Services
    for (const s of sampleServices) {
      batch.set(adminDb.collection("services").doc(s.serviceId), {
        ...s,
        createdAt: now,
        updatedAt: now,
      });
    }

    await batch.commit();

    return NextResponse.json({
      success: true,
      message: "Successfully seeded UCC Campus Grooming Vendors and Services into Firestore.",
      vendorsCount: sampleVendors.length,
      servicesCount: sampleServices.length,
    });
  } catch (error: any) {
    console.error("Seeding error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to seed database" },
      { status: 500 }
    );
  }
}
