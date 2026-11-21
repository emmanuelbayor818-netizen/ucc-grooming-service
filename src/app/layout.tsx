import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "UCC Grooming Service | Campus Barbers, Salons & Live Queue",
  description:
    "Premier grooming, haircut, and braiding appointment booking with live queue monitoring for University of Cape Coast (UCC) students and campus vendors.",
  keywords: [
    "UCC Grooming",
    "Cape Coast Barbers",
    "UCC Salons",
    "Casford Barbershop",
    "Science UCC Salon",
    "Amamoma Grooming",
    "UCC Queue Monitor",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-[#fdfbf7] text-[#1c1b18] antialiased">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
