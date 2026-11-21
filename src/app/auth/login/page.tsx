"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Scissors, AlertCircle, ArrowRight, Lock, Mail } from "lucide-react";

function LoginForm() {
  const { signIn } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      await signIn(email, password);
      router.push(redirectUrl);
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Failed to sign in. Please verify your email and password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full bg-white rounded-3xl border border-[#ede8e1] p-8 sm:p-10 shadow-sm space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-[#1c1b18] text-[#c59b27] flex items-center justify-center mx-auto">
          <Scissors className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-extrabold text-[#1c1b18] tracking-tight">
          Sign In to UCC Grooming
        </h1>
        <p className="text-xs text-[#736e65]">
          Access your bookings, queue monitoring, and grooming appointments.
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#4a4742]">Email Address</label>
          <div className="flex items-center px-3 py-2.5 rounded-xl border border-[#ede8e1] bg-[#fdfbf7] focus-within:ring-1 focus-within:ring-[#c59b27]">
            <Mail className="w-4 h-4 text-[#8a8479] mr-2" />
            <input
              type="email"
              placeholder="student@ucc.edu.gh"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent text-xs text-[#1c1b18] focus:outline-none"
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-[#4a4742]">Password</label>
            <Link
              href="/auth/forgot-password"
              className="text-[11px] font-semibold text-[#c59b27] hover:underline"
            >
              Forgot?
            </Link>
          </div>
          <div className="flex items-center px-3 py-2.5 rounded-xl border border-[#ede8e1] bg-[#fdfbf7] focus-within:ring-1 focus-within:ring-[#c59b27]">
            <Lock className="w-4 h-4 text-[#8a8479] mr-2" />
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent text-xs text-[#1c1b18] focus:outline-none"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-[#1c1b18] hover:bg-[#2d2b27] text-white font-bold text-xs disabled:opacity-50 transition-all flex items-center justify-center space-x-1.5"
        >
          <span>{loading ? "Authenticating..." : "Sign In"}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </form>

      {/* Quick Demo Fill Buttons */}
      <div className="space-y-2 pt-2">
        <p className="text-[10px] font-bold uppercase tracking-wider text-[#8a8479] text-center">
          Quick Demo Credentials
        </p>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => {
              setEmail("student@ucc.edu.gh");
              setPassword("StudentPass123!");
            }}
            className="py-1.5 px-2 rounded-lg bg-[#f4efe8] hover:bg-[#ebe4d8] text-[#1c1b18] text-[11px] font-semibold transition-colors"
          >
            🎓 Student
          </button>
          <button
            type="button"
            onClick={() => {
              setEmail("bbf@ucc.edu.gh");
              setPassword("VendorPass123!");
            }}
            className="py-1.5 px-2 rounded-lg bg-[#f4efe8] hover:bg-[#ebe4d8] text-[#1c1b18] text-[11px] font-semibold transition-colors"
          >
            ✂️ Vendor
          </button>
          <button
            type="button"
            onClick={() => {
              setEmail("admin@ucc.edu.gh");
              setPassword("AdminPass123!");
            }}
            className="py-1.5 px-2 rounded-lg bg-[#f4efe8] hover:bg-[#ebe4d8] text-[#1c1b18] text-[11px] font-semibold transition-colors"
          >
            🛡️ Admin
          </button>
        </div>
      </div>

      <div className="pt-4 border-t border-[#ede8e1] flex items-center justify-between text-xs text-[#736e65]">
        <Link
          href="/"
          className="hover:text-[#1c1b18] transition-colors"
        >
          ← Back to Directory
        </Link>
        <div>
          Don&apos;t have an account?{" "}
          <Link
            href="/auth/register"
            className="font-bold text-[#1c1b18] hover:text-[#c59b27] transition-colors"
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <Suspense fallback={<div className="text-xs text-[#8a8479]">Loading sign in...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
