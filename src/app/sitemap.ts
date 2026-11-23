import { MetadataRoute } from "next";
import { REAL_UCC_VENDORS } from "@/lib/constants/realVendors";

export const dynamic = "force-dynamic";
export const revalidate = 3600; // revalidate hourly

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    "https://ucc-grooming-service-production.up.railway.app";

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/auth/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/auth/register`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  // Start with default UCC campus vendor seed IDs
  let vendorIds: string[] = REAL_UCC_VENDORS.map((v) => v.vendorId!).filter(Boolean);

  // Dynamically include any newly registered vendor from Cloud Firestore
  try {
    const { adminDb } = await import("@/lib/firebase/admin");
    const snapshot = await adminDb.collection("vendors").get();
    if (!snapshot.empty) {
      const dbIds = snapshot.docs.map((doc) => doc.id);
      vendorIds = Array.from(new Set([...vendorIds, ...dbIds]));
    }
  } catch (err) {
    console.warn("Sitemap: using static fallback vendor list:", err);
  }

  const vendorRoutes: MetadataRoute.Sitemap = vendorIds.map((id) => ({
    url: `${baseUrl}/vendor/${id}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.9,
  }));

  return [...staticRoutes, ...vendorRoutes];
}
