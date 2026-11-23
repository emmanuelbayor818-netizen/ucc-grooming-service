import { MetadataRoute } from "next";
import { REAL_UCC_VENDORS } from "@/lib/constants/realVendors";

export default function sitemap(): MetadataRoute.Sitemap {
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

  const vendorRoutes: MetadataRoute.Sitemap = REAL_UCC_VENDORS.map((vendor) => ({
    url: `${baseUrl}/vendor/${vendor.vendorId}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.9,
  }));

  return [...staticRoutes, ...vendorRoutes];
}
