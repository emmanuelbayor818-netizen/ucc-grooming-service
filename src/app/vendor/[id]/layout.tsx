import type { Metadata } from "next";
import { REAL_UCC_VENDORS } from "@/lib/constants/realVendors";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    "https://ucc-grooming-service-production.up.railway.app";

  let shopName = "Campus Vendor Studio";
  let description =
    "Book haircuts, braiding, and grooming services online at the University of Cape Coast.";
  let profileImage = "/images/vendors/bbf-storefront.jpg";

  // Check known authentic UCC campus vendors first
  const fallback = REAL_UCC_VENDORS.find((v) => v.vendorId === id);
  if (fallback) {
    if (fallback.shopName) shopName = fallback.shopName;
    if (fallback.description) description = fallback.description;
    if (fallback.profileImage) profileImage = fallback.profileImage;
  } else {
    // If it's a newly registered vendor, fetch details dynamically from Firestore
    try {
      const { adminDb } = await import("@/lib/firebase/admin");
      const doc = await adminDb.collection("vendors").doc(id).get();
      if (doc.exists) {
        const data = doc.data();
        if (data?.shopName) shopName = data.shopName;
        if (data?.description) description = data.description;
        if (data?.profileImage) profileImage = data.profileImage;
      }
    } catch {
      // Use graceful fallback
    }
  }

  const title = `${shopName} | UCC Grooming Services`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${baseUrl}/vendor/${id}`,
      siteName: "UCC Grooming Services",
      images: [
        {
          url: profileImage.startsWith("http")
            ? profileImage
            : `${baseUrl}${profileImage}`,
          width: 800,
          height: 600,
          alt: shopName,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [
        profileImage.startsWith("http")
          ? profileImage
          : `${baseUrl}${profileImage}`,
      ],
    },
  };
}

export default function VendorDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
