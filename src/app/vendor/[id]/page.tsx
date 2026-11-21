"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Scissors,
  Star,
  MapPin,
  Clock,
  Phone,
  MessageCircle,
  ShieldCheck,
  Users,
  Calendar,
  CreditCard,
  Banknote,
  Check,
  AlertCircle,
  X,
  ArrowLeft,
  ExternalLink,
  Search,
  FileText,
  Image as ImageIcon,
  Navigation,
} from "lucide-react";
import { Vendor, ServiceItem, Review } from "@/types";
import { formatGHS } from "@/lib/utils/time";
import { calculateDistanceKm, UCC_COORDINATES } from "@/lib/constants/ucc";

export default function VendorDetailPage() {
  const params = useParams();
  const vendorId = params?.id as string;
  const router = useRouter();
  const { user, profile } = useAuth();

  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search inside Vendor Catalog
  const [serviceSearch, setServiceSearch] = useState("");
  const [selectedServiceCategory, setSelectedServiceCategory] = useState("all");

  // Price List Lightbox Modal
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Student GPS Location
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Booking Modal State
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  });
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [customerName, setCustomerName] = useState(profile?.fullName || "");
  const [customerPhone, setCustomerPhone] = useState(profile?.phoneNumber || "");
  const [customerNotes, setCustomerNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"paystack_momo" | "pay_at_shop">("pay_at_shop");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState<any>(null);

  // Sync profile details
  useEffect(() => {
    if (profile) {
      if (!customerName) setCustomerName(profile.fullName);
      if (!customerPhone) setCustomerPhone(profile.phoneNumber);
    }
  }, [profile]);

  // Request browser geolocation once
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        () => {
          // Fallback to UCC center
          setUserLocation(UCC_COORDINATES);
        }
      );
    }
  }, []);

  // Load Vendor, Services, and Reviews
  useEffect(() => {
    if (!vendorId) return;

    async function fetchData() {
      try {
        setLoading(true);
        const vRes = await fetch(`/api/vendors/${vendorId}`);
        if (vRes.ok) {
          const vData = await vRes.json();
          setVendor(vData.vendor);
          setServices(vData.services || []);
          setReviews(vData.reviews || []);
        }
      } catch (err) {
        console.error("Error fetching vendor profile:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [vendorId]);

  // Fetch available slots when service or date changes
  useEffect(() => {
    if (!vendorId || !selectedService || !selectedDate) return;

    async function fetchSlots() {
      try {
        setLoadingSlots(true);
        setSelectedSlot("");
        const res = await fetch(
          `/api/appointments/available-slots?vendorId=${vendorId}&date=${selectedDate}&duration=${selectedService?.duration || 30}`
        );
        if (res.ok) {
          const data = await res.json();
          setAvailableSlots(data.availableSlots || []);
        } else {
          setAvailableSlots([]);
        }
      } catch (err) {
        console.error("Error fetching slots:", err);
      } finally {
        setLoadingSlots(false);
      }
    }

    fetchSlots();
  }, [vendorId, selectedService, selectedDate]);

  // Handle appointment creation
  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push(`/auth/login?redirect=/vendor/${vendorId}`);
      return;
    }
    if (!selectedSlot) {
      setBookingError("Please pick an available time slot for your appointment.");
      return;
    }

    try {
      setBookingLoading(true);
      setBookingError("");

      const res = await fetch("/api/appointments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: user.uid,
          customerName: customerName || "UCC Student",
          customerPhone: customerPhone || "",
          vendorId,
          serviceId: selectedService!.serviceId,
          appointmentDate: selectedDate,
          startTime: selectedSlot,
          paymentMethod,
          customerNotes,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Slot was just taken by another student. Please choose another slot.");
      }

      setBookingSuccess(data.appointment);

      // If online payment is chosen, initialize Paystack
      if (paymentMethod === "paystack_momo") {
        const payRes = await fetch("/api/payments/initialize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            appointmentId: data.appointment.appointmentId,
            customerId: user.uid,
            customerEmail: user.email,
            amount: selectedService!.price,
            vendorId,
          }),
        });

        const payData = await payRes.json();
        if (payData.authorizationUrl) {
          window.location.href = payData.authorizationUrl;
          return;
        }
      }
    } catch (err: any) {
      setBookingError(err.message || "Failed to reserve appointment");
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-[#c59b27] border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-sm text-[#8a8479]">Loading campus studio profile...</p>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-[#1c1b18]">Shop not found</h2>
        <p className="text-sm text-[#736e65]">
          The campus salon or barbershop you are looking for might have been moved or updated.
        </p>
        <button
          onClick={() => router.push("/")}
          className="px-4 py-2 bg-[#1c1b18] text-white rounded-xl text-xs font-semibold"
        >
          Back to Campus Directory
        </button>
      </div>
    );
  }

  const queueCount = vendor.currentQueueCount || 0;
  const estWaitMins = queueCount * 25;

  // Filter services by search and category
  const filteredServices = services.filter((srv) => {
    const matchesSearch =
      serviceSearch === "" ||
      srv.serviceName.toLowerCase().includes(serviceSearch.toLowerCase()) ||
      srv.description.toLowerCase().includes(serviceSearch.toLowerCase());

    const matchesCat =
      selectedServiceCategory === "all" || srv.category === selectedServiceCategory;

    return matchesSearch && matchesCat;
  });

  // Calculate distance from student's GPS location
  let distanceText = "";
  if (userLocation && vendor.latitude && vendor.longitude) {
    const km = calculateDistanceKm(
      userLocation.lat,
      userLocation.lng,
      vendor.latitude,
      vendor.longitude
    );
    distanceText = `${km} km from you`;
  }

  // Find official price list flyer image from gallery if available
  const priceListImage = vendor.gallery?.find((img) => img.includes("pricelist") || img.includes("flyer"));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* Back button */}
      <div>
        <button
          onClick={() => router.back()}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#736e65] hover:text-[#1c1b18] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Discovery</span>
        </button>
      </div>

      {/* 1. SHOP HERO & PREMISES BANNER */}
      <div className="bg-white rounded-3xl border border-[#ede8e1] overflow-hidden shadow-xs">
        <div className="relative h-64 sm:h-80 w-full bg-[#f4efe8]">
          <img
            src={vendor.profileImage}
            alt={vendor.shopName}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent"></div>

          <div className="absolute bottom-6 left-6 right-6 text-white flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2 max-w-xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold">
                  {vendor.area}
                </span>
                {vendor.verificationStatus === "verified" && (
                  <span className="px-3 py-1 rounded-full bg-emerald-600/90 backdrop-blur-md text-xs font-semibold flex items-center space-x-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Verified UCC Vendor</span>
                  </span>
                )}
                {distanceText && (
                  <span className="px-3 py-1 rounded-full bg-blue-600/90 backdrop-blur-md text-xs font-semibold flex items-center space-x-1">
                    <Navigation className="w-3 h-3" />
                    <span>{distanceText}</span>
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                {vendor.shopName}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-stone-200">
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4 text-[#c59b27]" />
                  <span>{vendor.businessAddress}</span>
                </div>
                <div className="flex items-center space-x-1 font-bold text-white">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span>{vendor.rating || 5.0}</span>
                  <span className="font-normal text-stone-300">({vendor.reviewCount || 0} reviews)</span>
                </div>
              </div>
            </div>

            {/* Quick Contact & Directions Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {vendor.latitude && vendor.longitude && (
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${vendor.latitude},${vendor.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-semibold text-xs flex items-center space-x-1.5 transition-colors"
                  title="Open GPS directions in Google Maps"
                >
                  <MapPin className="w-4 h-4 text-[#c59b27]" />
                  <span>Get Directions</span>
                </a>
              )}

              {vendor.whatsappNumber && (
                <a
                  href={`https://wa.me/${vendor.whatsappNumber.replace(/[^0-9]/g, "")}?text=Hi%20${encodeURIComponent(vendor.shopName)},%20I%20am%20a%20UCC%20student%20inquiring%20about%20a%20grooming%20appointment.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center space-x-1.5 transition-colors shadow-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp</span>
                </a>
              )}

              {vendor.phoneNumber && (
                <a
                  href={`tel:${vendor.phoneNumber}`}
                  className="px-4 py-2.5 rounded-xl bg-white/20 backdrop-blur-md hover:bg-white/30 text-white font-semibold text-xs flex items-center space-x-1.5 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call {vendor.phoneNumber}</span>
                </a>
              )}
            </div>

          </div>
        </div>

        {/* Live Queue Radar Strip */}
        <div className="px-6 py-4 bg-[#fdfbf7] border-t border-[#ede8e1] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#f4efe8] flex items-center justify-center text-[#c59b27] shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#8a8479]">
                Live Walk-In / Chair Radar
              </div>
              <div className="text-sm font-semibold text-[#1c1b18]">
                {queueCount === 0
                  ? "No wait right now. Chairs are available!"
                  : `${queueCount} student${queueCount === 1 ? "" : "s"} waiting (~${estWaitMins} min est. wait)`}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {priceListImage && (
              <button
                onClick={() => setLightboxImage(priceListImage)}
                className="px-3.5 py-2 rounded-xl border border-[#ede8e1] bg-white hover:bg-[#f4efe8] text-xs font-semibold text-[#1c1b18] flex items-center space-x-1.5 transition-colors shadow-xs"
              >
                <FileText className="w-3.5 h-3.5 text-[#c59b27]" />
                <span>View Official Price Flyer</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. MAIN CONTENT GRID (SERVICES CATALOG & PREMISES PHOTOS) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Services Catalog */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-[#1c1b18] tracking-tight">
                Services & Verified Prices
              </h2>
              <p className="text-xs text-[#736e65] mt-0.5">
                Showing {filteredServices.length} verified services. Select any service to view open slots and book.
              </p>
            </div>

            {/* Quick search input within catalog */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-[#8a8479] absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search services..."
                value={serviceSearch}
                onChange={(e) => setServiceSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-[#ede8e1] rounded-xl text-xs text-[#1c1b18] focus:outline-none focus:ring-1 focus:ring-[#c59b27]"
              />
            </div>
          </div>

          {/* Services List */}
          <div className="space-y-3">
            {filteredServices.map((srv) => (
              <div
                key={srv.serviceId}
                className="p-5 rounded-2xl bg-white border border-[#ede8e1] shadow-xs hover:border-[#c59b27] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-base text-[#1c1b18]">
                      {srv.serviceName}
                    </h3>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-[#f4efe8] text-[#4a4742]">
                      {srv.duration} mins
                    </span>
                    {srv.pricingType === "starting_at" && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                        Varies by style
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-[#615c54] leading-relaxed">
                    {srv.description}
                  </p>

                  <div className="text-base font-extrabold text-[#1c1b18]">
                    {formatGHS(srv.price)}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedService(srv);
                    setBookingSuccess(null);
                    setBookingError("");
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[#1c1b18] hover:bg-[#2e2c28] text-white font-semibold text-xs shrink-0 transition-all shadow-xs"
                >
                  Book Slot
                </button>
              </div>
            ))}
          </div>

          {/* Student Reviews Section */}
          <div className="pt-8 space-y-4">
            <h3 className="text-lg font-bold text-[#1c1b18]">
              Verified Student Reviews ({reviews.length})
            </h3>

            {reviews.length === 0 ? (
              <div className="p-6 bg-white rounded-2xl border border-[#ede8e1] text-center text-xs text-[#8a8479]">
                No reviews yet for this vendor. Completed student appointments can leave verified reviews.
              </div>
            ) : (
              <div className="space-y-3">
                {reviews.map((rev) => (
                  <div
                    key={rev.reviewId}
                    className="p-4 rounded-xl bg-white border border-[#ede8e1] space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-xs text-[#1c1b18]">
                        {rev.customerName || "UCC Student"}
                      </div>
                      <div className="flex items-center space-x-1 text-xs">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        <span className="font-bold text-[#1c1b18]">{rev.rating}</span>
                      </div>
                    </div>
                    <p className="text-xs text-[#615c54]">{rev.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Shop Gallery & Premises Info */}
        <div className="space-y-6">
          
          {/* Premises Gallery Card */}
          {vendor.gallery && vendor.gallery.length > 0 && (
            <div className="bg-white rounded-2xl border border-[#ede8e1] p-5 space-y-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-[#1c1b18] flex items-center space-x-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-[#c59b27]" />
                <span>Shop Premises & Flyers</span>
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {vendor.gallery.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setLightboxImage(img)}
                    className="relative h-28 rounded-xl overflow-hidden border border-[#ede8e1] group focus:outline-none"
                  >
                    <img
                      src={img}
                      alt="Premises"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                      <span className="text-[10px] text-white opacity-0 group-hover:opacity-100 font-bold">
                        Click to Zoom
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Operating Hours & Policy */}
          <div className="bg-white rounded-2xl border border-[#ede8e1] p-6 space-y-4">
            <h3 className="font-bold text-xs text-[#1c1b18] uppercase tracking-wider">
              Operating Schedule
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#8a8479]">Zone</span>
                <span className="font-semibold text-[#1c1b18]">{vendor.area}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8a8479]">Address</span>
                <span className="font-semibold text-[#1c1b18] text-right truncate max-w-[180px]">
                  {vendor.businessAddress}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8a8479]">Working Hours</span>
                <span className="font-semibold text-[#1c1b18]">
                  {vendor.vendorId === "ucc_vend_magdee_beauty" ? "24-Hour Service" : "08:00 - 22:00"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8a8479]">Payment Accepted</span>
                <span className="font-semibold text-[#1c1b18]">MoMo & Cash at Shop</span>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#ede8df] text-[#4a4742] space-y-2">
            <h4 className="font-bold text-xs uppercase tracking-wider text-[#1c1b18]">
              Anti-Double-Booking Protected
            </h4>
            <p className="text-[11px] leading-relaxed">
              Every slot selected is locked using Firestore atomic transactions. If two students select the same slot simultaneously, the server verifies and grants the slot to the first request.
            </p>
          </div>
        </div>

      </div>

      {/* 3. LIGHTBOX FLYER MODAL */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-2xl max-h-[90vh] bg-transparent">
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-stone-300 p-2 text-sm font-bold flex items-center space-x-1"
            >
              <X className="w-6 h-6" />
              <span>Close</span>
            </button>
            <img
              src={lightboxImage}
              alt="Official Vendor Price Flyer"
              className="max-h-[85vh] w-auto mx-auto rounded-2xl shadow-2xl border border-stone-800"
            />
          </div>
        </div>
      )}

      {/* 4. INTERACTIVE BOOKING MODAL */}
      {selectedService && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl relative border border-[#ede8e1]">
            
            {/* Close Button */}
            <button
              onClick={() => setSelectedService(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-[#8a8479] hover:text-[#1c1b18] hover:bg-[#f4efe8]"
            >
              <X className="w-5 h-5" />
            </button>

            {bookingSuccess ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                  <Check className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold text-[#1c1b18]">
                  Appointment Reserved!
                </h3>
                <p className="text-xs text-[#615c54] max-w-xs mx-auto">
                  Your slot for <span className="font-semibold text-[#1c1b18]">{bookingSuccess.serviceNameSnapshot}</span> on <span className="font-semibold text-[#1c1b18]">{bookingSuccess.appointmentDate}</span> at <span className="font-semibold text-[#1c1b18]">{bookingSuccess.startTime}</span> has been locked in Firestore.
                </p>

                {/* Direct WhatsApp notify link for student */}
                {vendor.whatsappNumber && (
                  <div className="pt-2">
                    <a
                      href={`https://wa.me/${vendor.whatsappNumber.replace(/[^0-9]/g, "")}?text=Hi%20${encodeURIComponent(vendor.shopName)},%20I%20just%20booked%20${encodeURIComponent(bookingSuccess.serviceNameSnapshot)}%20for%20${bookingSuccess.appointmentDate}%20at%20${bookingSuccess.startTime}.%20Booking%20ID:%20${bookingSuccess.appointmentId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center space-x-1.5 transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Notify Shop on WhatsApp</span>
                    </a>
                  </div>
                )}

                <div className="pt-2 flex flex-col space-y-2">
                  <button
                    onClick={() => router.push("/customer/dashboard")}
                    className="w-full py-3 rounded-xl bg-[#1c1b18] text-white font-semibold text-xs"
                  >
                    View in My Appointments
                  </button>
                  <button
                    onClick={() => {
                      setSelectedService(null);
                      setBookingSuccess(null);
                    }}
                    className="w-full py-2.5 rounded-xl border border-[#ede8e1] text-xs font-semibold text-[#4a4742]"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleConfirmBooking} className="space-y-5">
                
                {/* Modal Title & Summary */}
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#c59b27]">
                    Book Appointment
                  </span>
                  <h3 className="text-xl font-bold text-[#1c1b18]">
                    {selectedService.serviceName}
                  </h3>
                  <div className="flex items-center space-x-3 text-xs text-[#8a8479] mt-1">
                    <span>{selectedService.duration} minutes</span>
                    <span>•</span>
                    <span className="font-bold text-[#1c1b18]">{formatGHS(selectedService.price)}</span>
                  </div>
                </div>

                {bookingError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{bookingError}</span>
                  </div>
                )}

                {/* 1. Date Picker */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#4a4742] flex items-center space-x-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#c59b27]" />
                    <span>Select Date</span>
                  </label>
                  <input
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#ede8e1] text-sm text-[#1c1b18] focus:outline-none focus:ring-1 focus:ring-[#c59b27]"
                    required
                  />
                </div>

                {/* 2. Slot Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#4a4742] flex items-center justify-between">
                    <span className="flex items-center space-x-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#c59b27]" />
                      <span>Available Time Slots</span>
                    </span>
                    {loadingSlots && <span className="text-[10px] text-[#8a8479]">Checking Firestore slots...</span>}
                  </label>

                  {loadingSlots ? (
                    <div className="py-4 text-center text-xs text-[#8a8479]">
                      Loading verified available times...
                    </div>
                  ) : availableSlots.length === 0 ? (
                    <div className="p-3 bg-[#fdfbf7] rounded-xl border border-[#ede8e1] text-center text-xs text-[#8a8479]">
                      No available slots for this date. The vendor may be fully booked or closed.
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 gap-2 max-h-36 overflow-y-auto p-1">
                      {availableSlots.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setSelectedSlot(slot)}
                          className={`py-2 px-1 text-xs font-semibold rounded-lg border transition-all ${
                            selectedSlot === slot
                              ? "bg-[#1c1b18] text-white border-[#1c1b18] shadow-xs"
                              : "bg-[#fdfbf7] text-[#4a4742] border-[#ede8e1] hover:bg-[#ede8df]"
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* 3. Student Information */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#4a4742]">Your Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Samuel Mensah"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#ede8e1] text-xs focus:outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#4a4742]">Phone / MoMo</label>
                    <input
                      type="tel"
                      placeholder="024 123 4567"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#ede8e1] text-xs focus:outline-none"
                      required
                    />
                  </div>
                </div>

                {/* Special notes */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#4a4742]">Special Hairstyle / Cut Request</label>
                  <input
                    type="text"
                    placeholder="e.g. Skin taper on the sides, natural wave on top"
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#ede8e1] text-xs focus:outline-none"
                  />
                </div>

                {/* 4. Payment Method Choice */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-[#4a4742]">Payment Preference</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("pay_at_shop")}
                      className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                        paymentMethod === "pay_at_shop"
                          ? "border-[#1c1b18] bg-[#f4efe8]"
                          : "border-[#ede8e1] bg-white hover:bg-[#fdfbf7]"
                      }`}
                    >
                      <Banknote className="w-4 h-4 text-[#1c1b18] mb-1" />
                      <div className="text-xs font-bold text-[#1c1b18]">Pay at Shop</div>
                      <div className="text-[10px] text-[#8a8479]">Cash or MoMo on arrival</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod("paystack_momo")}
                      className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                        paymentMethod === "paystack_momo"
                          ? "border-[#1c1b18] bg-[#f4efe8]"
                          : "border-[#ede8e1] bg-white hover:bg-[#fdfbf7]"
                      }`}
                    >
                      <CreditCard className="w-4 h-4 text-[#c59b27] mb-1" />
                      <div className="text-xs font-bold text-[#1c1b18]">Pay Online Now</div>
                      <div className="text-[10px] text-[#8a8479]">MTN / Telecel / Card</div>
                    </button>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={bookingLoading || !selectedSlot}
                  className="w-full py-3 rounded-xl bg-[#1c1b18] hover:bg-[#2d2b27] text-white font-bold text-xs disabled:opacity-50 transition-all flex items-center justify-center space-x-2"
                >
                  {bookingLoading ? (
                    <span>Securing Slot...</span>
                  ) : (
                    <span>Confirm & Lock Appointment</span>
                  )}
                </button>

              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
