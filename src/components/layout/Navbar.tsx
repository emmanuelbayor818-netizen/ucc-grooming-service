"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Scissors, User, LogOut, Menu, X, Shield, Store, Calendar, Bell } from "lucide-react";

export function Navbar() {
  const { user, profile, role, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 neutral-glass border-b border-[#ede8e1] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-[#1c1b18] text-[#c59b27] flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <span
                className="font-bold text-lg tracking-tight text-[#1c1b18]"
                suppressHydrationWarning
              >
                UCC GROOMING SERVICES
              </span>
              <span className="block text-[10px] tracking-wider uppercase font-semibold text-[#8a8479]">
                Campus & Community Hub
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-7 text-sm font-medium text-[#4a4742]">
            <Link
              href="/"
              className={`hover:text-[#1c1b18] transition-colors ${
                pathname === "/" ? "text-[#1c1b18] font-semibold" : ""
              }`}
            >
              Discover
            </Link>
            <Link
              href="/#campus-zones"
              className="hover:text-[#1c1b18] transition-colors"
            >
              Campus Zones
            </Link>
            <Link
              href="/#live-queues"
              className="hover:text-[#1c1b18] transition-colors flex items-center space-x-1.5"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Live Queue Monitor</span>
            </Link>

            {/* Portal Shortcuts Based on Role */}
            {role === "customer" && (
              <Link
                href="/customer/dashboard"
                className={`hover:text-[#1c1b18] transition-colors flex items-center space-x-1.5 ${
                  pathname.startsWith("/customer") ? "text-[#c59b27] font-semibold" : ""
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>My Appointments</span>
              </Link>
            )}

            {role === "vendor" && (
              <Link
                href="/vendor/dashboard"
                className={`hover:text-[#1c1b18] transition-colors flex items-center space-x-1.5 ${
                  pathname.startsWith("/vendor") ? "text-[#c59b27] font-semibold" : ""
                }`}
              >
                <Store className="w-4 h-4" />
                <span>Vendor Hub</span>
              </Link>
            )}

            {role === "admin" && (
              <Link
                href="/admin/dashboard"
                className={`hover:text-[#1c1b18] transition-colors flex items-center space-x-1.5 ${
                  pathname.startsWith("/admin") ? "text-[#c59b27] font-semibold" : ""
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>Admin Console</span>
              </Link>
            )}
          </nav>

          {/* Right Action / Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-sm font-semibold text-[#1c1b18] leading-tight">
                    {profile?.fullName || user.email?.split("@")[0]}
                  </div>
                  <div className="text-xs uppercase tracking-wider text-[#8a8479] font-medium">
                    {role || "Student"}
                  </div>
                </div>

                <Link
                  href={
                    role === "admin"
                      ? "/admin/dashboard"
                      : role === "vendor"
                      ? "/vendor/dashboard"
                      : "/customer/dashboard"
                  }
                  className="w-9 h-9 rounded-full bg-[#f4efe8] border border-[#ede8e1] flex items-center justify-center text-[#1c1b18] hover:bg-[#eae4dc] transition-colors"
                  title="Go to Dashboard"
                >
                  <User className="w-4 h-4" />
                </Link>

                <button
                  onClick={handleLogout}
                  className="p-2 text-[#736e65] hover:text-rose-600 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/auth/login"
                  className="text-sm font-medium text-[#4a4742] hover:text-[#1c1b18] px-3 py-2 rounded-lg transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  className="text-sm font-medium bg-[#1c1b18] text-[#fdfbf7] hover:bg-[#2e2c28] px-4 py-2.5 rounded-xl shadow-sm transition-all"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-[#4a4742] hover:text-[#1c1b18]"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#ede8e1] bg-[#fdfbf7] px-4 pt-3 pb-6 space-y-3">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-[#1c1b18] hover:bg-[#f4efe8]"
          >
            Discover Salons & Barbers
          </Link>
          <Link
            href="/#live-queues"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-[#1c1b18] hover:bg-[#f4efe8]"
          >
            Live Queue Monitor
          </Link>

          {user ? (
            <>
              {role === "customer" && (
                <Link
                  href="/customer/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-base font-medium text-[#c59b27] hover:bg-[#f4efe8]"
                >
                  My Appointments
                </Link>
              )}
              {role === "vendor" && (
                <Link
                  href="/vendor/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-base font-medium text-[#c59b27] hover:bg-[#f4efe8]"
                >
                  Vendor Management
                </Link>
              )}
              {role === "admin" && (
                <Link
                  href="/admin/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-base font-medium text-[#c59b27] hover:bg-[#f4efe8]"
                >
                  Admin Console
                </Link>
              )}
              <div className="pt-2 border-t border-[#ede8e1]">
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-rose-600 font-medium"
                >
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <div className="pt-2 border-t border-[#ede8e1] flex flex-col space-y-2">
              <Link
                href="/auth/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center py-2.5 rounded-xl border border-[#ede8e1] text-[#1c1b18] font-medium"
              >
                Sign In
              </Link>
              <Link
                href="/auth/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center py-2.5 rounded-xl bg-[#1c1b18] text-white font-medium"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
