"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Shield,
  Users,
  Store,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Clock,
  Sparkles,
} from "lucide-react";
import { Vendor, AdminLog } from "@/types";

export default function AdminDashboardPage() {
  const { user, profile, role, isAdmin, loading } = useAuth();
  const router = useRouter();

  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [seeding, setSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState("");
  const [activeTab, setActiveTab] = useState<"vendors" | "logs">("vendors");
  const [loadingData, setLoadingData] = useState(true);

  const loadAdminData = async () => {
    try {
      setLoadingData(true);
      const vRes = await fetch("/api/vendors?area=All");
      if (vRes.ok) {
        const vData = await vRes.json();
        setVendors(vData.vendors || []);
      }
    } catch (err) {
      console.error("Admin data fetch error:", err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleVendorAction = async (vendorId: string, action: "verify" | "suspend") => {
    try {
      const res = await fetch("/api/admin/vendors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminId: user?.uid || "admin",
          vendorId,
          action,
        }),
      });

      if (res.ok) {
        await loadAdminData();
      }
    } catch (err) {
      alert("Action failed");
    }
  };

  const handleSeedDemoData = async () => {
    try {
      setSeeding(true);
      setSeedMessage("");
      const res = await fetch("/api/admin/seed", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setSeedMessage(`Successfully initialized campus vendors across Science, Casford, and Amamoma!`);
        await loadAdminData();
      } else {
        setSeedMessage(data.error || "Seed failed");
      }
    } catch (err: any) {
      setSeedMessage("Seeding error");
    } finally {
      setSeeding(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <div className="w-8 h-8 border-2 border-[#c59b27] border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-sm text-[#8a8479] mt-3">Validating Admin Credentials...</p>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white border border-[#ede8e1] rounded-3xl text-center space-y-5 shadow-xs">
        <div className="w-14 h-14 rounded-2xl bg-[#fdfbf7] border border-[#ede8e1] text-[#c59b27] flex items-center justify-center mx-auto">
          <Shield className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-[#1c1b18]">Administrator Access Required</h2>
          <p className="text-xs text-[#736e65]">
            This portal is restricted to authorized UCC Grooming Services administrators.
          </p>
        </div>
        <div className="pt-2 flex flex-col gap-2.5">
          <button
            onClick={() => router.push("/auth/login?redirect=/admin/dashboard")}
            className="w-full py-3 px-4 rounded-xl bg-[#1c1b18] text-white text-xs font-bold hover:bg-[#2d2b27] transition-all shadow-xs"
          >
            Sign In with Admin Account
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

  const verifiedCount = vendors.filter((v) => v.verificationStatus === "verified").length;
  const pendingCount = vendors.filter((v) => v.verificationStatus === "pending").length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Admin Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#ede8e1] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#c59b27] flex items-center space-x-1.5">
            <Shield className="w-3.5 h-3.5" />
            <span>UCC Platform Administration</span>
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1c1b18] tracking-tight mt-1">
            Governance & Oversight Console
          </h1>
          <p className="text-xs sm:text-sm text-[#736e65] mt-1">
            Supervise campus vendor verification, dispute audits, and platform seed controls.
          </p>
        </div>

        {/* Quick Seed Button */}
        <button
          onClick={handleSeedDemoData}
          disabled={seeding}
          className="px-4 py-2.5 rounded-xl bg-[#1c1b18] text-[#fdfbf7] hover:bg-[#2d2b27] text-xs font-semibold flex items-center space-x-2 transition-all disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4 text-[#c59b27]" />
          <span>{seeding ? "Populating..." : "Seed / Reset Campus Demo Data"}</span>
        </button>
      </div>

      {seedMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
          {seedMessage}
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-[#ede8e1]">
          <div className="text-xs text-[#8a8479]">Verified Vendors</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">{verifiedCount}</div>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-[#ede8e1]">
          <div className="text-xs text-[#8a8479]">Pending Approvals</div>
          <div className="text-2xl font-black text-amber-600 mt-1">{pendingCount}</div>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-[#ede8e1]">
          <div className="text-xs text-[#8a8479]">Active Campus Zones</div>
          <div className="text-2xl font-black text-[#1c1b18] mt-1">6</div>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-[#ede8e1]">
          <div className="text-xs text-[#8a8479]">Cloud Engine</div>
          <div className="text-2xl font-black text-[#c59b27] mt-1">Firebase</div>
        </div>
      </div>

      {/* Vendor Oversight List */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[#1c1b18]">
          Campus Barber & Salon Register ({vendors.length})
        </h2>

        <div className="bg-white rounded-2xl border border-[#ede8e1] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f4efe8] border-b border-[#ede8e1] text-[#4a4742] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Shop Name</th>
                  <th className="py-3 px-4">Campus Zone</th>
                  <th className="py-3 px-4">Phone / WhatsApp</th>
                  <th className="py-3 px-4">Rating</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ede8e1]">
                {vendors.map((v) => (
                  <tr key={v.vendorId} className="hover:bg-[#fdfbf7]">
                    <td className="py-3.5 px-4 font-bold text-[#1c1b18]">
                      {v.shopName}
                    </td>
                    <td className="py-3.5 px-4 text-[#736e65]">
                      {v.area}
                    </td>
                    <td className="py-3.5 px-4 text-[#736e65]">
                      {v.phoneNumber}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-[#1c1b18]">
                      ⭐ {v.rating || 5.0} ({v.reviewCount || 0})
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          v.verificationStatus === "verified"
                            ? "bg-emerald-100 text-emerald-800"
                            : v.verificationStatus === "pending"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {v.verificationStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      {v.verificationStatus !== "verified" ? (
                        <button
                          onClick={() => handleVendorAction(v.vendorId, "verify")}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-semibold text-[11px]"
                        >
                          Verify & Approve
                        </button>
                      ) : (
                        <button
                          onClick={() => handleVendorAction(v.vendorId, "suspend")}
                          className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 font-semibold text-[11px]"
                        >
                          Suspend
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
}
