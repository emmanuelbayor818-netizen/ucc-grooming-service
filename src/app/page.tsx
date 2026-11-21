"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Scissors,
  MapPin,
  Clock,
  Star,
  Users,
  Search,
  Sparkles,
  ShieldCheck,
  CheckCircle,
  Phone,
  ArrowRight,
  Navigation,
  Map as MapIcon,
  Grid,
  ExternalLink,
} from "lucide-react";
import { Vendor, VendorCategory, CampusArea } from "@/types";
import { VENDOR_CATEGORIES, UCC_CAMPUS_AREAS, calculateDistanceKm, UCC_COORDINATES } from "@/lib/constants/ucc";
import { formatGHS } from "@/lib/utils/time";
import { CampusMap } from "@/components/map/CampusMap";

export default function HomePage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArea, setSelectedArea] = useState<string>("All");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locatingUser, setLocatingUser] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");
  const [sortByDistance, setSortByDistance] = useState(false);

  // Fetch vendors from Firestore API
  useEffect(() => {
    async function loadVendors() {
      try {
        setLoading(true);
        const res = await fetch("/api/vendors");
        if (res.ok) {
          const data = await res.json();
          setVendors(data.vendors || []);
        }
      } catch (err) {
        console.warn("Error fetching campus vendors:", err);
      } finally {
        setLoading(false);
      }
    }
    loadVendors();
  }, []);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setLocatingUser(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setSortByDistance(true);
        setLocatingUser(false);
      },
      (err) => {
        console.warn("Location permission denied or unavailable, using UCC Ayensu center:", err);
        // Default to UCC coordinates for demo
        setUserLocation(UCC_COORDINATES);
        setSortByDistance(true);
        setLocatingUser(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Filter and sort vendors
  let filteredVendors = vendors.filter((v) => {
    const matchesSearch =
      searchQuery === "" ||
      v.shopName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.area.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesArea = selectedArea === "All" || v.area === selectedArea;

    const matchesCategory =
      selectedCategory === "All" ||
      v.categories?.includes(selectedCategory as VendorCategory);

    return matchesSearch && matchesArea && matchesCategory;
  });

  if (sortByDistance && userLocation) {
    filteredVendors = [...filteredVendors].sort((a, b) => {
      const distA = calculateDistanceKm(userLocation.lat, userLocation.lng, a.latitude, a.longitude);
      const distB = calculateDistanceKm(userLocation.lat, userLocation.lng, b.latitude, b.longitude);
      return distA - distB;
    });
  }

  return (
    <div className="space-y-16 pb-16">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#f4efe8] via-[#fdfbf7] to-[#fdfbf7] border-b border-[#ede8e1] pt-12 pb-20">
        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#1c1b18_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            
            {/* Campus Tag */}
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#ede8df] text-[#4a4742] text-xs font-semibold tracking-wide uppercase">
              <span className="w-2 h-2 rounded-full bg-[#c59b27]"></span>
              <span>University of Cape Coast Student & Staff Network</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#1c1b18] leading-[1.15]">
              Guaranteed Chair Time. <br className="hidden sm:inline" />
              <span className="gold-gradient-text">Zero Hall Queue Stress.</span>
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg text-[#615c54] leading-relaxed max-w-2xl mx-auto">
              Book verified campus barbershops, braiders, stylists, and nail salons across Ayensu, Kwaprow, School Bus Road, and Esuekyir with live GPS distance and real-time wait monitors.
            </p>

            {/* Search & Filter Bar */}
            <div className="bg-white p-2.5 sm:p-3 rounded-2xl shadow-xl shadow-stone-200/50 border border-[#ede8e1] flex flex-col md:flex-row items-stretch gap-2.5 max-w-2xl mx-auto">
              
              <div className="flex-1 flex items-center px-3 bg-[#fdfbf7] rounded-xl border border-[#ede8e1]">
                <Search className="w-5 h-5 text-[#8a8479] mr-2 shrink-0" />
                <input
                  type="text"
                  placeholder="Search barbers, braids, permcut, wig styling..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent py-2.5 text-sm text-[#1c1b18] focus:outline-none placeholder-[#8a8479]"
                />
              </div>

              <div className="flex items-center space-x-2">
                <select
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value)}
                  className="bg-[#fdfbf7] border border-[#ede8e1] rounded-xl px-3 py-2.5 text-sm text-[#4a4742] focus:outline-none focus:ring-1 focus:ring-[#c59b27]"
                >
                  <option value="All">All Campus Zones</option>
                  {UCC_CAMPUS_AREAS.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>

                <button
                  onClick={handleGetLocation}
                  disabled={locatingUser}
                  className={`px-3.5 py-2.5 rounded-xl border transition-colors flex items-center space-x-1.5 text-xs font-semibold shrink-0 ${
                    userLocation
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                      : "bg-[#fdfbf7] border-[#ede8e1] text-[#4a4742] hover:bg-[#ede8df]"
                  }`}
                  title="Find shops closest to your hostel via GPS"
                >
                  <Navigation className={`w-3.5 h-3.5 ${userLocation ? "text-emerald-600 fill-emerald-600" : "text-[#c59b27]"}`} />
                  <span className="hidden sm:inline">
                    {userLocation ? "GPS Active" : locatingUser ? "Locating..." : "Locate Me"}
                  </span>
                </button>
              </div>

            </div>

            {/* Quick Metrics */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-medium text-[#736e65]">
              <div className="flex items-center space-x-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>7 Verified UCC Studios</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Clock className="w-4 h-4 text-[#c59b27]" />
                <span>Anti-Double-Booking Guarantee</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Users className="w-4 h-4 text-indigo-600" />
                <span>Live Wait-Time Counters</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. LIVE QUEUE MONITOR (HIGHLIGHT FEATURE) */}
      <section id="live-queues" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[#c59b27]">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span>Live Campus Wait-Time Radar</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1c1b18] mt-1 tracking-tight">
              Real-Time Barber & Salon Queue Status
            </h2>
            <p className="text-sm text-[#736e65] mt-1">
              Check who is busy or open right now before heading out from your hostel or hall.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {vendors.slice(0, 4).map((v) => {
            const queueCount = v.currentQueueCount || 0;
            const estWait = queueCount * 25; // 25 mins average per cut/style
            const isHeavy = queueCount >= 3;

            return (
              <div
                key={v.vendorId}
                className="bg-white rounded-2xl border border-[#ede8e1] p-5 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#f4efe8] text-[#4a4742]">
                      {v.area}
                    </span>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full flex items-center space-x-1 ${
                        isHeavy
                          ? "bg-amber-100 text-amber-800"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      <span>{isHeavy ? "Busy Queue" : "Open & Fast"}</span>
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-[#1c1b18] text-base leading-snug line-clamp-1">
                      {v.shopName}
                    </h3>
                    <p className="text-xs text-[#8a8479] line-clamp-1 mt-0.5">
                      {v.businessAddress}
                    </p>
                  </div>

                  {/* Queue Metric Box */}
                  <div className="p-3 bg-[#fdfbf7] rounded-xl border border-[#ede8e1] flex items-center justify-between">
                    <div>
                      <div className="text-xs text-[#8a8479]">In Chair & Waiting</div>
                      <div className="text-lg font-bold text-[#1c1b18] flex items-center space-x-1">
                        <Users className="w-4 h-4 text-[#c59b27]" />
                        <span>{queueCount} {queueCount === 1 ? "student" : "students"}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-[#8a8479]">Est. Wait</div>
                      <div className="text-sm font-semibold text-[#4a4742]">
                        {queueCount === 0 ? "Immediate" : `~${estWait} mins`}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-2 border-t border-[#ede8e1] flex items-center justify-between">
                  <div className="flex items-center space-x-1 text-xs font-semibold text-[#1c1b18]">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>{v.rating || "4.8"}</span>
                    <span className="text-[#8a8479]">({v.reviewCount || 30})</span>
                  </div>

                  <Link
                    href={`/vendor/${v.vendorId}`}
                    className="text-xs font-bold text-[#c59b27] hover:text-[#a67c1e] flex items-center space-x-1"
                  >
                    <span>Reserve Slot</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. CATEGORY SELECTOR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#8a8479] mb-4">
          Browse by Grooming Service
        </h3>
        <div className="flex items-center space-x-2.5 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategory("All")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold shrink-0 transition-colors ${
              selectedCategory === "All"
                ? "bg-[#1c1b18] text-white"
                : "bg-white border border-[#ede8e1] text-[#4a4742] hover:bg-[#f4efe8]"
            }`}
          >
            All Specialties
          </button>
          {VENDOR_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold shrink-0 transition-colors flex items-center space-x-1.5 ${
                selectedCategory === cat.id
                  ? "bg-[#1c1b18] text-white"
                  : "bg-white border border-[#ede8e1] text-[#4a4742] hover:bg-[#f4efe8]"
              }`}
            >
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 4. VERIFIED VENDORS DIRECTORY & INTERACTIVE GPS MAP */}
      <section id="directory" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-[#1c1b18] tracking-tight">
              Verified Campus Salons & Barbershops
            </h2>
            <p className="text-sm text-[#736e65]">
              Showing {filteredVendors.length} spots in UCC campus and surrounding student corridors.
            </p>
          </div>

          {/* View Mode Toggle: Grid vs Map */}
          <div className="flex items-center space-x-2 self-start sm:self-auto">
            {userLocation && (
              <button
                onClick={() => setSortByDistance(!sortByDistance)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center space-x-1.5 transition-colors ${
                  sortByDistance
                    ? "bg-[#1c1b18] text-white border-[#1c1b18]"
                    : "bg-white text-[#4a4742] border-[#ede8e1] hover:bg-[#f4efe8]"
                }`}
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Sort by Distance</span>
              </button>
            )}

            <div className="p-1 bg-[#f4efe8] rounded-xl flex items-center space-x-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  viewMode === "grid"
                    ? "bg-white text-[#1c1b18] shadow-xs"
                    : "text-[#736e65] hover:text-[#1c1b18]"
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                <span>Cards</span>
              </button>

              <button
                onClick={() => setViewMode("map")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  viewMode === "map"
                    ? "bg-white text-[#1c1b18] shadow-xs"
                    : "text-[#736e65] hover:text-[#1c1b18]"
                }`}
              >
                <MapIcon className="w-3.5 h-3.5" />
                <span>GPS Radar Map</span>
              </button>
            </div>
          </div>
        </div>

        {/* View Mode: Map View */}
        {viewMode === "map" ? (
          <div className="space-y-4">
            <CampusMap
              vendors={filteredVendors}
              userLocation={userLocation}
            />
            <p className="text-xs text-[#8a8479] text-center">
              💡 Tip: Click on any pin on the map to view student queue count, distance from your hostel, and instant directions.
            </p>
          </div>
        ) : loading ? (
          <div className="py-20 text-center text-[#8a8479] space-y-3">
            <div className="w-8 h-8 border-2 border-[#c59b27] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-sm font-medium">Loading verified campus studios from Cloud Firestore...</p>
          </div>
        ) : filteredVendors.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#ede8e1] p-12 text-center space-y-4">
            <Scissors className="w-10 h-10 text-[#8a8479] mx-auto opacity-50" />
            <h3 className="text-lg font-bold text-[#1c1b18]">No grooming spots found</h3>
            <p className="text-sm text-[#736e65] max-w-md mx-auto">
              No campus vendors matched your current filter. Try resetting your search query or selecting &quot;All Campus Zones&quot;.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedArea("All");
                setSelectedCategory("All");
              }}
              className="px-4 py-2 rounded-xl bg-[#1c1b18] text-white text-xs font-semibold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVendors.map((vendor) => {
              let distanceKm: number | null = null;
              if (userLocation && vendor.latitude && vendor.longitude) {
                distanceKm = calculateDistanceKm(
                  userLocation.lat,
                  userLocation.lng,
                  vendor.latitude,
                  vendor.longitude
                );
              }

              return (
                <div
                  key={vendor.vendorId}
                  className="bg-white rounded-2xl border border-[#ede8e1] overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group"
                >
                  {/* Image & Badges */}
                  <div className="relative h-52 w-full bg-[#f4efe8] overflow-hidden">
                    <img
                      src={
                        vendor.profileImage ||
                        "/images/vendors/bbf-storefront.jpg"
                      }
                      alt={vendor.shopName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                      <span className="px-2.5 py-1 rounded-md bg-[#1c1b18]/85 backdrop-blur-md text-white text-[11px] font-semibold">
                        {vendor.area}
                      </span>
                      {vendor.verificationStatus === "verified" && (
                        <span className="px-2.5 py-1 rounded-md bg-emerald-700/90 backdrop-blur-md text-white text-[11px] font-semibold flex items-center space-x-1">
                          <ShieldCheck className="w-3 h-3" />
                          <span>Verified UCC Vendor</span>
                        </span>
                      )}
                    </div>

                    {distanceKm !== null && (
                      <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-md bg-white/95 backdrop-blur-md text-[#1c1b18] text-[11px] font-bold shadow-xs flex items-center space-x-1">
                        <Navigation className="w-3 h-3 text-[#c59b27]" />
                        <span>{distanceKm} km away</span>
                      </div>
                    )}
                  </div>

                  {/* Body Details */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-lg text-[#1c1b18] leading-tight">
                          {vendor.shopName}
                        </h3>
                        <div className="flex items-center space-x-1 text-xs font-bold text-[#1c1b18]">
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                          <span>{vendor.rating || "5.0"}</span>
                          <span className="text-[#8a8479]">({vendor.reviewCount || 0})</span>
                        </div>
                      </div>

                      <p className="text-xs text-[#615c54] line-clamp-2 leading-relaxed">
                        {vendor.description}
                      </p>

                      <div className="flex items-center justify-between text-xs text-[#8a8479] pt-1">
                        <div className="flex items-center space-x-1 truncate max-w-[70%]">
                          <MapPin className="w-3.5 h-3.5 text-[#c59b27] shrink-0" />
                          <span className="truncate">{vendor.businessAddress}</span>
                        </div>

                        {vendor.latitude && vendor.longitude && (
                          <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${vendor.latitude},${vendor.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] font-bold text-[#c59b27] hover:underline flex items-center space-x-1 shrink-0"
                            title="Get directions in Google Maps"
                          >
                            <span>Directions</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Footer Row */}
                    <div className="pt-3 border-t border-[#ede8e1] flex items-center justify-between">
                      <div className="text-xs">
                        <span className="text-[#8a8479]">Starting from </span>
                        <span className="font-bold text-[#1c1b18]">
                          {vendor.categories?.includes("barbering") ? "GH₵ 10.00" : "GH₵ 20.00"}
                        </span>
                      </div>

                      <Link
                        href={`/vendor/${vendor.vendorId}`}
                        className="px-4 py-2 rounded-xl bg-[#1c1b18] text-white hover:bg-[#2d2b27] text-xs font-semibold transition-colors flex items-center space-x-1"
                      >
                        <span>View & Book</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 5. HOW IT WORKS FOR STUDENTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="bg-[#171614] rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden">
          <div className="max-w-2xl space-y-3 mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-[#c59b27]">
              Student-First Platform
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Grooming at UCC Made Effortless
            </h2>
            <p className="text-sm text-[#a8a39a]">
              Never sit idly for 2 hours in a cramped hall barbershop again. Three quick steps to flawless hair:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3 p-5 rounded-2xl bg-[#23221f] border border-[#2f2e2a]">
              <div className="w-9 h-9 rounded-xl bg-[#c59b27] text-[#1c1b18] font-bold text-sm flex items-center justify-center">
                1
              </div>
              <h3 className="font-bold text-base text-white">Find Your Campus Spot</h3>
              <p className="text-xs text-[#a8a39a] leading-relaxed">
                Filter by hall or hostel (Ayensu, Kwaprow, School Bus Road, Esuekyir) and check live customer wait times.
              </p>
            </div>

            <div className="space-y-3 p-5 rounded-2xl bg-[#23221f] border border-[#2f2e2a]">
              <div className="w-9 h-9 rounded-xl bg-[#c59b27] text-[#1c1b18] font-bold text-sm flex items-center justify-center">
                2
              </div>
              <h3 className="font-bold text-base text-white">Lock In Your Exact Slot</h3>
              <p className="text-xs text-[#a8a39a] leading-relaxed">
                Pick a guaranteed 20, 30, or 60 minute appointment slot. Concurrency protection ensures no double-booking.
              </p>
            </div>

            <div className="space-y-3 p-5 rounded-2xl bg-[#23221f] border border-[#2f2e2a]">
              <div className="w-9 h-9 rounded-xl bg-[#c59b27] text-[#1c1b18] font-bold text-sm flex items-center justify-center">
                3
              </div>
              <h3 className="font-bold text-base text-white">Flexible Campus Payment</h3>
              <p className="text-xs text-[#a8a39a] leading-relaxed">
                Pay in advance via MTN/Telecel Mobile Money with Paystack, or choose &quot;Pay at Shop&quot; once you sit in the chair.
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
