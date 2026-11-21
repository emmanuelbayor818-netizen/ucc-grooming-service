"use client";

import React from "react";
import Link from "next/link";
import { Scissors, ShieldCheck, MapPin, Phone, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#171614] text-[#a8a39a] border-t border-[#292825] mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Brand & Campus Bio */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-[#292825] text-[#c59b27] flex items-center justify-center">
                <Scissors className="w-5 h-5" />
              </div>
              <span className="font-bold text-white text-lg tracking-tight">
                UCC GROOMING
              </span>
            </div>
            <p className="text-sm leading-relaxed text-[#8a8479]">
              The official online appointment booking & real-time queue platform tailored exclusively for the University of Cape Coast student community and campus vendors.
            </p>
            <div className="flex items-center space-x-2 text-xs text-[#c59b27]">
              <ShieldCheck className="w-4 h-4" />
              <span>Powered 100% by Google Firebase Ecosystem</span>
            </div>
          </div>

          {/* Campus Zones */}
          <div>
            <h4 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">
              Campus Hotspots
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-center space-x-2">
                <MapPin className="w-3.5 h-3.5 text-[#c59b27]" />
                <Link href="/?area=Science" className="hover:text-white transition-colors">
                  Science Market & Old Site
                </Link>
              </li>
              <li className="flex items-center space-x-2">
                <MapPin className="w-3.5 h-3.5 text-[#c59b27]" />
                <Link href="/?area=Valco / Casford" className="hover:text-white transition-colors">
                  Casford Hall & Valco Wing
                </Link>
              </li>
              <li className="flex items-center space-x-2">
                <MapPin className="w-3.5 h-3.5 text-[#c59b27]" />
                <Link href="/?area=Amamoma" className="hover:text-white transition-colors">
                  Amamoma High Street
                </Link>
              </li>
              <li className="flex items-center space-x-2">
                <MapPin className="w-3.5 h-3.5 text-[#c59b27]" />
                <Link href="/?area=Oguaa / ATL" className="hover:text-white transition-colors">
                  ATL Oceanfront & Oguaa Hall
                </Link>
              </li>
              <li className="flex items-center space-x-2">
                <MapPin className="w-3.5 h-3.5 text-[#c59b27]" />
                <Link href="/?area=Kwaprow" className="hover:text-white transition-colors">
                  Kwaprow Student Belt
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform Portals */}
          <div>
            <h4 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">
              Portals & Services
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/auth/register?role=customer" className="hover:text-white transition-colors">
                  Student Registration
                </Link>
              </li>
              <li>
                <Link href="/auth/register?role=vendor" className="hover:text-white transition-colors">
                  Register as Campus Vendor
                </Link>
              </li>
              <li>
                <Link href="/customer/dashboard" className="hover:text-white transition-colors">
                  Manage Booking History
                </Link>
              </li>
              <li>
                <Link href="/vendor/dashboard" className="hover:text-white transition-colors">
                  Vendor Queue & Service Hub
                </Link>
              </li>
              <li>
                <Link href="/admin/dashboard" className="hover:text-white transition-colors">
                  UCC Administration Access
                </Link>
              </li>
            </ul>
          </div>

          {/* Student Support & Safety */}
          <div>
            <h4 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">
              Student Trust & Safety
            </h4>
            <p className="text-sm text-[#8a8479] leading-relaxed mb-4">
              Verified campus barbering and cosmetology standards. Strict anti-double-booking policy and verified reviews.
            </p>
            <div className="text-xs space-y-1.5 text-[#8a8479]">
              <div className="flex items-center space-x-2">
                <Phone className="w-3.5 h-3.5 text-[#c59b27]" />
                <span>UCC Emergency / SRC Desk: 03321 32480</span>
              </div>
              <p>Cape Coast, Central Region, Ghana</p>
            </div>
          </div>

        </div>

        <div className="border-t border-[#292825] mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#736e65]">
          <p>© 2026 UCC Grooming Service. All rights reserved.</p>
          <p className="flex items-center space-x-1 mt-2 sm:mt-0">
            <span>Built with care for the UCC Student Body</span>
            <Heart className="w-3 h-3 text-rose-500 fill-rose-500 inline" />
          </p>
        </div>
      </div>
    </footer>
  );
}
