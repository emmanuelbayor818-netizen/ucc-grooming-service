"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Scissors, Mail, ArrowRight, CheckCircle, AlertCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      await resetPassword(email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to send password reset email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl border border-[#ede8e1] p-8 sm:p-10 shadow-sm space-y-6">
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#1c1b18] text-[#c59b27] flex items-center justify-center mx-auto">
            <Scissors className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#1c1b18] tracking-tight">
            Reset Your Password
          </h1>
          <p className="text-xs text-[#736e65]">
            Enter your registered UCC email address and we will send you a secure reset link.
          </p>
        </div>

        {success ? (
          <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
            <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto" />
            <h3 className="font-bold text-sm text-emerald-900">Reset Email Dispatched</h3>
            <p className="text-xs text-emerald-700">
              Please check your inbox at <span className="font-semibold">{email}</span> and follow the instructions to set your new password.
            </p>
            <Link
              href="/auth/login"
              className="inline-block mt-2 text-xs font-bold text-[#1c1b18] hover:underline"
            >
              Back to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#1c1b18] hover:bg-[#2d2b27] text-white font-bold text-xs disabled:opacity-50 transition-all flex items-center justify-center space-x-1.5"
            >
              <span>{loading ? "Sending link..." : "Send Password Reset Link"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <div className="text-center pt-2">
              <Link href="/auth/login" className="text-xs text-[#736e65] hover:text-[#1c1b18]">
                Remembered your password? Sign In
              </Link>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
