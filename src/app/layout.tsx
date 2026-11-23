import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const siteUrl =
  process.env.NEXT_PUBLIC_APP_URL ||
  "https://ucc-grooming-service-production.up.railway.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "UCC Grooming Services | Campus Barbers, Salons & Live Queue Tracker",
    template: "%s | UCC Grooming Services",
  },
  description:
    "Official appointment booking and real-time live queue monitoring for University of Cape Coast (UCC) students and campus vendors in Ayensu, Kwaprow, Science, Casford, and Valco.",
  keywords: [
    "UCC Grooming Services",
    "UCC Grooming",
    "UCC Barbershop",
    "Cape Coast Barbers",
    "UCC Salon",
    "University of Cape Coast grooming",
    "Ayensu Barber",
    "Kwaprow Salon",
    "UCC student hair cut",
    "Casford Hall salon",
    "Valco Hall grooming",
    "Ghana campus barber",
    "UCC queue monitor",
    "BBF Barber Shop UCC",
    "Classic Cuts UCC",
    "Beauty by Deborah UCC",
    "The Graduate Barber UCC",
    "Grace Beauty Salon UCC",
    "God's Time Beauty Salon UCC",
    "MAGDEE Beauty Salon UCC",
  ],
  authors: [{ name: "UCC Grooming Services Team" }],
  creator: "UCC Grooming Services",
  publisher: "UCC Grooming Services",
  formatDetection: {
    email: false,
    address: true,
    telephone: true,
  },
  openGraph: {
    type: "website",
    locale: "en_GH",
    url: siteUrl,
    siteName: "UCC Grooming Services",
    title: "UCC Grooming Services | Campus Barbers, Salons & Live Queue Tracker",
    description:
      "Book appointments and track live salon/barber queue times across the University of Cape Coast campus.",
    images: [
      {
        url: "/images/vendors/bbf-storefront.jpg",
        width: 1200,
        height: 630,
        alt: "UCC Grooming Services Campus Hub",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "UCC Grooming Services | Campus Barbers, Salons & Live Queue",
    description:
      "Book appointments and track live salon/barber queue times across University of Cape Coast campus.",
    images: ["/images/vendors/bbf-storefront.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: siteUrl,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "UCC Grooming Services",
  url: siteUrl,
  applicationCategory: "LifestyleApplication",
  operatingSystem: "All",
  description:
    "Official appointment booking and real-time live queue monitoring for University of Cape Coast (UCC) students and campus vendors.",
  areaServed: {
    "@type": "AdministrativeArea",
    name: "University of Cape Coast, Cape Coast, Central Region, Ghana",
  },
  offers: {
    "@type": "AggregateOffer",
    priceCurrency: "GHS",
    lowPrice: "15",
    highPrice: "250",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className="min-h-screen flex flex-col bg-[#fdfbf7] text-[#1c1b18] antialiased"
        suppressHydrationWarning
      >
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
