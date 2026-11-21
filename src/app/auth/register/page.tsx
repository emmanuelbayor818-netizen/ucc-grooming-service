"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Scissors, Store, User, AlertCircle, ArrowRight } from "lucide-react";
import { UCC_CAMPUS_AREAS, VENDOR_CATEGORIES } from "@/lib/constants/ucc";
import { UserRole } from "@/types";

function RegisterForm() {
  const { signUp } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = (searchParams.get("role") as UserRole) || "customer";

  const [role, setRole] = useState<UserRole>(defaultRole);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");

  const [shopName, setShopName] = useState("");
  const [campusArea, setCampusArea] = useState<string>("Science");
  const [businessAddress, setBusinessAddress] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["barbering"]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");

      const vendorDetails =
        role === "vendor"
          ? {
              shopName: shopName || `${fullName}'s Grooming Hub`,
              area: campusArea,
              categories: selectedCategories,
              businessAddress: businessAddress || `UCC Campus, ${campusArea}`,
            }
          : undefined;

      await signUp(email, password, fullName, phoneNumber, role, vendorDetails);

      if (role === "vendor") {
        router.push("/vendor/dashboard");
      } else {
        router.push("/customer/dashboard");
      }
    } catch (err: any) {
      console.error("Signup error:", err);
      setError(err.message || "Failed to register. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (catId: string) => {
    if (selectedCategories.includes(catId)) {
      if (selectedCategories.length > 1) {
        setSelectedCategories(selectedCategories.filter((c) => c !== catId));
      }
    } else {
      setSelectedCategories([...selectedCategories, catId]);
    }
  };

  return (
    <div className="max-w-lg w-full bg-white rounded-3xl border border-[#ede8e1] p-8 sm:p-10 shadow-sm space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-[#1c1b18] text-[#c59b27] flex items-center justify-center mx-auto">
          <Scissors className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-extrabold text-[#1c1b18] tracking-tight">
          Join UCC Grooming Service
        </h1>
        <p className="text-xs text-[#736e65]">
          Create your account to book cuts or manage your campus grooming studio.
        </p>
      </div>

      <div className="grid grid-cols-2 p-1 bg-[#f4efe8] rounded-2xl">
        <button
          type="button"
          onClick={() => setRole("customer")}
          className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
            role === "customer"
              ? "bg-white text-[#1c1b18] shadow-xs"
              : "text-[#736e65] hover:text-[#1c1b18]"
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>I am a Student</span>
        </button>

        <button
          type="button"
          onClick={() => setRole("vendor")}
          className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
            role === "vendor"
              ? "bg-white text-[#1c1b18] shadow-xs"
              : "text-[#736e65] hover:text-[#1c1b18]"
          }`}
        >
          <Store className="w-3.5 h-3.5" />
          <span>I am a Barber / Salon</span>
        </button>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-[#4a4742]">Full Name</label>
          <input
            type="text"
            placeholder="e.g. Kwesi Appiah"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-[#ede8e1] text-xs focus:outline-none"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#4a4742]">Email Address</label>
            <input
              type="email"
              placeholder="student@ucc.edu.gh"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-[#ede8e1] text-xs focus:outline-none"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#4a4742]">Phone / WhatsApp</label>
            <input
              type="tel"
              placeholder="024 123 4567"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-[#ede8e1] text-xs focus:outline-none"
              required
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-[#4a4742]">Password</label>
          <input
            type="password"
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-[#ede8e1] text-xs focus:outline-none"
            required
            minLength={6}
          />
        </div>

        {role === "vendor" && (
          <div className="pt-3 border-t border-[#ede8e1] space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-[#c59b27]">
              Shop & Business Details
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#4a4742]">Shop / Brand Name</label>
              <input
                type="text"
                placeholder="e.g. Casford Cutz Studio"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-[#ede8e1] text-xs focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#4a4742]">Campus Area</label>
                <select
                  value={campusArea}
                  onChange={(e) => setCampusArea(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#ede8e1] text-xs focus:outline-none bg-white"
                >
                  {UCC_CAMPUS_AREAS.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#4a4742]">Physical Address</label>
                <input
                  type="text"
                  placeholder="e.g. Casford Hall Ground Floor"
                  value={businessAddress}
                  onChange={(e) => setBusinessAddress(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#ede8e1] text-xs focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#4a4742]">Grooming Specialties</label>
              <div className="flex flex-wrap gap-1.5">
                {VENDOR_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleCategory(cat.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                      selectedCategories.includes(cat.id)
                        ? "bg-[#1c1b18] text-white"
                        : "bg-[#f4efe8] text-[#4a4742] hover:bg-[#ede8df]"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-[#1c1b18] hover:bg-[#2d2b27] text-white font-bold text-xs disabled:opacity-50 transition-all flex items-center justify-center space-x-1.5"
        >
          <span>{loading ? "Creating Account..." : "Create Account"}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </form>

      <div className="pt-4 border-t border-[#ede8e1] text-center text-xs text-[#736e65]">
        Already have an account?{" "}
        <Link
          href="/auth/login"
          className="font-bold text-[#1c1b18] hover:text-[#c59b27] transition-colors"
        >
          Sign In Here
        </Link>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <Suspense fallback={<div className="text-xs text-[#8a8479]">Loading registration...</div>}>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
