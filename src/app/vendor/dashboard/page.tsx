"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Users,
  Calendar,
  Clock,
  Plus,
  Minus,
  CheckCircle,
  Scissors,
  Check,
  X,
  Store,
  DollarSign,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { Appointment, ServiceItem, Vendor } from "@/types";
import { REAL_UCC_VENDORS, REAL_UCC_SERVICES } from "@/lib/constants/realVendors";
import { formatGHS } from "@/lib/utils/time";

export default function VendorDashboardPage() {
  const { user, profile, role, loading } = useAuth();
  const router = useRouter();

  const [vendor, setVendor] = useState<Vendor | null>(REAL_UCC_VENDORS[0] as Vendor);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<ServiceItem[]>(
    REAL_UCC_SERVICES.filter((s) => s.vendorId === REAL_UCC_VENDORS[0].vendorId) as ServiceItem[]
  );
  const [queueCount, setQueueCount] = useState<number>(REAL_UCC_VENDORS[0].currentQueueCount || 2);
  const [updatingQueue, setUpdatingQueue] = useState(false);
  const [activeTab, setActiveTab] = useState<"bookings" | "services" | "hours">("bookings");
  const [dataLoading, setDataLoading] = useState(false);

  // New Service Modal
  const [newServiceModalOpen, setNewServiceModalOpen] = useState(false);
  const [newServiceName, setNewServiceName] = useState("");
  const [newServiceDesc, setNewServiceDesc] = useState("");
  const [newServicePrice, setNewServicePrice] = useState("");
  const [newServiceDuration, setNewServiceDuration] = useState("30");
  const [serviceSubmitting, setServiceSubmitting] = useState(false);

  const loadVendorData = async () => {
    if (!user) return;
    try {
      setDataLoading(true);
      const vendorId = user.uid; // 1:1 vendor mapping

      const vRes = await fetch(`/api/vendors/${vendorId}`);
      if (vRes.ok) {
        const vData = await vRes.json();
        if (vData.vendor) {
          setVendor(vData.vendor);
          setServices(vData.services || []);
          setQueueCount(vData.vendor?.currentQueueCount || 0);
        }
      }

      // Fetch bookings for this vendor
      const apptRes = await fetch(`/api/vendor/appointments?vendorId=${vendorId}`);
      if (apptRes.ok) {
        const apptData = await apptRes.json();
        setAppointments(apptData.appointments || []);
      }
    } catch (err) {
      console.error("Error loading vendor data:", err);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadVendorData();
    }
  }, [user]);

  // Handle live queue counter update
  const handleUpdateQueue = async (newCount: number) => {
    const safeCount = Math.max(0, newCount);
    setQueueCount(safeCount);
    try {
      setUpdatingQueue(true);
      await fetch("/api/vendor/queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendorId: user!.uid,
          customerCount: safeCount,
          estimatedWaitMinutesPerPerson: 25,
        }),
      });
    } catch (err) {
      console.error("Queue update error:", err);
    } finally {
      setUpdatingQueue(false);
    }
  };

  // Handle appointment status transition
  const handleUpdateApptStatus = async (appointmentId: string, newStatus: string) => {
    try {
      const res = await fetch("/api/appointments/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentId,
          newStatus,
          updatedBy: user?.uid,
        }),
      });

      if (res.ok) {
        await loadVendorData();
      }
    } catch (err) {
      alert("Failed to update booking status.");
    }
  };

  // Handle creating a new service
  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceName || !newServicePrice) return;

    try {
      setServiceSubmitting(true);
      const res = await fetch("/api/vendor/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendorId: user!.uid,
          serviceName: newServiceName,
          description: newServiceDesc,
          price: Number(newServicePrice),
          duration: Number(newServiceDuration),
          isAvailable: true,
        }),
      });

      if (res.ok) {
        setNewServiceModalOpen(false);
        setNewServiceName("");
        setNewServiceDesc("");
        setNewServicePrice("");
        await loadVendorData();
      }
    } catch (err) {
      alert("Failed to add service");
    } finally {
      setServiceSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <div className="w-8 h-8 border-2 border-[#c59b27] border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-sm text-[#8a8479] mt-3">Loading vendor studio hub...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white border border-[#ede8e1] rounded-3xl text-center space-y-5 shadow-xs">
        <div className="w-14 h-14 rounded-2xl bg-[#fdfbf7] border border-[#ede8e1] text-[#c59b27] flex items-center justify-center mx-auto">
          <Store className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-[#1c1b18]">Vendor Studio Access</h2>
          <p className="text-xs text-[#736e65]">
            Please sign in with your vendor account to manage your live walk-in queue, confirm customer bookings, and update services.
          </p>
        </div>
        <div className="pt-2 flex flex-col gap-2.5">
          <button
            onClick={() => router.push("/auth/login?redirect=/vendor/dashboard")}
            className="w-full py-3 px-4 rounded-xl bg-[#1c1b18] text-white text-xs font-bold hover:bg-[#2d2b27] transition-all shadow-xs"
          >
            Sign In to Vendor Hub
          </button>
          <button
            onClick={() => router.push("/auth/register")}
            className="w-full py-3 px-4 rounded-xl border border-[#ede8e1] text-[#4a4742] text-xs font-semibold hover:bg-[#f4efe8] transition-all"
          >
            Register as a Campus Vendor
          </button>
          <button
            onClick={() => router.push("/")}
            className="text-xs text-[#8a8479] hover:text-[#1c1b18] hover:underline pt-1 transition-colors"
          >
            ← Back to Campus Directory
          </button>
        </div>
      </div>
    );
  }

  const pendingBookings = appointments.filter((a) => a.bookingStatus === "pending");
  const confirmedBookings = appointments.filter((a) => a.bookingStatus === "confirmed");
  const inProgressBookings = appointments.filter((a) => a.bookingStatus === "in_progress");
  const completedBookings = appointments.filter((a) => a.bookingStatus === "completed");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* 1. VENDOR HEADER & LIVE QUEUE CONTROLLER */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#ede8e1] shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#c59b27]">
              Campus Vendor Command
            </span>
            <span className="px-2 py-0.5 rounded-md bg-[#f4efe8] text-[#4a4742] text-[10px] font-bold">
              {vendor?.area || "UCC Campus"}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1c1b18] tracking-tight mt-1">
            {vendor?.shopName || "My Grooming Studio"}
          </h1>
          <p className="text-xs sm:text-sm text-[#736e65] mt-1">
            Manage your live walk-in queue, confirm customer bookings, and maintain your service menu.
          </p>
        </div>

        {/* Real-Time Live Queue Counter Widget */}
        <div className="p-4 rounded-2xl bg-[#fdfbf7] border border-[#ede8e1] flex items-center space-x-6 shrink-0">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#8a8479]">
              Live Walk-In Queue
            </div>
            <div className="text-2xl font-black text-[#1c1b18]">
              {queueCount} <span className="text-xs font-normal text-[#8a8479]">in shop</span>
            </div>
            <div className="text-[10px] text-[#736e65]">
              Est. wait: ~{queueCount * 25} mins
            </div>
          </div>

          {/* Quick Increment / Decrement Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleUpdateQueue(queueCount - 1)}
              disabled={queueCount <= 0 || updatingQueue}
              className="w-9 h-9 rounded-xl bg-white border border-[#ede8e1] flex items-center justify-center text-[#1c1b18] hover:bg-[#f4efe8] disabled:opacity-40"
              title="One customer finished / left"
            >
              <Minus className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleUpdateQueue(queueCount + 1)}
              disabled={updatingQueue}
              className="w-9 h-9 rounded-xl bg-[#1c1b18] text-white flex items-center justify-center hover:bg-[#2d2b27] disabled:opacity-40 shadow-xs"
              title="New walk-in arrived"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-3 border-b border-[#ede8e1] pb-3">
        <button
          onClick={() => setActiveTab("bookings")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center space-x-1.5 ${
            activeTab === "bookings"
              ? "bg-[#1c1b18] text-white"
              : "text-[#736e65] hover:text-[#1c1b18] hover:bg-[#f4efe8]"
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Appointments Pipeline ({appointments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("services")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center space-x-1.5 ${
            activeTab === "services"
              ? "bg-[#1c1b18] text-white"
              : "text-[#736e65] hover:text-[#1c1b18] hover:bg-[#f4efe8]"
          }`}
        >
          <Scissors className="w-4 h-4" />
          <span>Services Menu ({services.length})</span>
        </button>
      </div>

      {/* 2. TAB CONTENT */}
      {dataLoading ? (
        <div className="py-20 text-center text-xs text-[#8a8479]">
          Loading studio pipeline...
        </div>
      ) : activeTab === "bookings" ? (
        <div className="space-y-6">
          
          {/* Summary counts */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-[#ede8e1]">
              <div className="text-xs text-[#8a8479]">Pending Requests</div>
              <div className="text-xl font-bold text-blue-600">{pendingBookings.length}</div>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-[#ede8e1]">
              <div className="text-xs text-[#8a8479]">Confirmed Next</div>
              <div className="text-xl font-bold text-emerald-600">{confirmedBookings.length}</div>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-[#ede8e1]">
              <div className="text-xs text-[#8a8479]">In Chair Now</div>
              <div className="text-xl font-bold text-amber-600">{inProgressBookings.length}</div>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-[#ede8e1]">
              <div className="text-xs text-[#8a8479]">Completed</div>
              <div className="text-xl font-bold text-[#1c1b18]">{completedBookings.length}</div>
            </div>
          </div>

          {/* Appointments List */}
          {appointments.length === 0 ? (
            <div className="p-12 bg-white rounded-2xl border border-[#ede8e1] text-center text-xs text-[#8a8479]">
              No appointments yet. As students book through the campus directory, they will appear here.
            </div>
          ) : (
            <div className="space-y-3">
              {appointments.map((appt) => (
                <div
                  key={appt.appointmentId}
                  className="bg-white rounded-2xl border border-[#ede8e1] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-bold text-base text-[#1c1b18]">
                        {appt.customerName || "UCC Student"}
                      </h3>
                      <span className="text-xs text-[#8a8479]">
                        ({appt.customerPhone || "No Phone"})
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          appt.bookingStatus === "confirmed"
                            ? "bg-emerald-100 text-emerald-800"
                            : appt.bookingStatus === "in_progress"
                            ? "bg-amber-100 text-amber-800"
                            : appt.bookingStatus === "completed"
                            ? "bg-stone-100 text-stone-700"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {appt.bookingStatus.replace("_", " ")}
                      </span>
                    </div>

                    <div className="text-xs text-[#615c54]">
                      <span className="font-semibold text-[#1c1b18]">{appt.serviceNameSnapshot}</span> • {appt.appointmentDate} at {appt.startTime} - {appt.endTime} • {formatGHS(appt.agreedPrice)} ({appt.paymentMethod === "pay_at_shop" ? "Pay at Shop" : "Online MoMo"})
                    </div>

                    {appt.customerNotes && (
                      <p className="text-[11px] text-[#8a8479] italic">
                        Note: &quot;{appt.customerNotes}&quot;
                      </p>
                    )}
                  </div>

                  {/* Actions for Vendor */}
                  <div className="flex items-center space-x-2 shrink-0">
                    {appt.bookingStatus === "pending" && (
                      <button
                        onClick={() => handleUpdateApptStatus(appt.appointmentId, "confirmed")}
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
                      >
                        Accept & Confirm
                      </button>
                    )}

                    {appt.bookingStatus === "confirmed" && (
                      <button
                        onClick={() => handleUpdateApptStatus(appt.appointmentId, "in_progress")}
                        className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold"
                      >
                        Seat Customer (In Chair)
                      </button>
                    )}

                    {appt.bookingStatus === "in_progress" && (
                      <button
                        onClick={() => handleUpdateApptStatus(appt.appointmentId, "completed")}
                        className="px-3.5 py-2 rounded-xl bg-[#1c1b18] hover:bg-[#2d2b27] text-white text-xs font-semibold"
                      >
                        Mark Completed & Paid
                      </button>
                    )}

                    {["pending", "confirmed"].includes(appt.bookingStatus) && (
                      <button
                        onClick={() => handleUpdateApptStatus(appt.appointmentId, "cancelled")}
                        className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl"
                        title="Decline / Cancel"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* SERVICES MENU TAB */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#1c1b18]">
                Your Service Catalog
              </h2>
              <p className="text-xs text-[#736e65]">
                Services visible to UCC students in your shop booking modal.
              </p>
            </div>
            <button
              onClick={() => setNewServiceModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#1c1b18] text-white text-xs font-semibold flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Service</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((srv) => (
              <div
                key={srv.serviceId}
                className="p-5 rounded-2xl bg-white border border-[#ede8e1] flex items-center justify-between"
              >
                <div>
                  <h3 className="font-bold text-sm text-[#1c1b18]">{srv.serviceName}</h3>
                  <p className="text-xs text-[#615c54] mt-0.5">{srv.description}</p>
                  <div className="text-xs font-bold text-[#c59b27] mt-2">
                    {formatGHS(srv.price)} • {srv.duration} mins
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ADD SERVICE MODAL */}
      {newServiceModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 relative border border-[#ede8e1] shadow-2xl">
            <button
              onClick={() => setNewServiceModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-[#8a8479] hover:text-[#1c1b18]"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-xl font-bold text-[#1c1b18]">Add Service to Menu</h3>
              <p className="text-xs text-[#736e65]">Offer a new haircut or beauty treatment to students</p>
            </div>

            <form onSubmit={handleCreateService} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#4a4742]">Service Name</label>
                <input
                  type="text"
                  placeholder="e.g. Skin Fade & Beard Trim"
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#ede8e1] text-xs focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#4a4742]">Description</label>
                <input
                  type="text"
                  placeholder="Brief description of cut or technique"
                  value={newServiceDesc}
                  onChange={(e) => setNewServiceDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#ede8e1] text-xs focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#4a4742]">Price (GH₵)</label>
                  <input
                    type="number"
                    placeholder="35"
                    value={newServicePrice}
                    onChange={(e) => setNewServicePrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#ede8e1] text-xs focus:outline-none"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#4a4742]">Duration (Mins)</label>
                  <select
                    value={newServiceDuration}
                    onChange={(e) => setNewServiceDuration(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#ede8e1] text-xs focus:outline-none bg-white"
                  >
                    <option value="20">20 mins</option>
                    <option value="30">30 mins</option>
                    <option value="45">45 mins</option>
                    <option value="60">60 mins</option>
                    <option value="90">90 mins</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={serviceSubmitting}
                className="w-full py-3 rounded-xl bg-[#1c1b18] text-white font-bold text-xs disabled:opacity-50 transition-all"
              >
                {serviceSubmitting ? "Adding Service..." : "Publish Service"}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
