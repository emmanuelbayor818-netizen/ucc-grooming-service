"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  Calendar,
  Clock,
  Star,
  CheckCircle,
  XCircle,
  AlertCircle,
  Scissors,
  CreditCard,
  Banknote,
  Send,
  X,
} from "lucide-react";
import { Appointment } from "@/types";
import { formatGHS } from "@/lib/utils/time";

export default function CustomerDashboardPage() {
  const { user, profile, role, loading } = useAuth();
  const router = useRouter();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"upcoming" | "history">("upcoming");

  // Review Modal State
  const [reviewAppt, setReviewAppt] = useState<Appointment | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewMsg, setReviewMsg] = useState("");

  const loadAppointments = async () => {
    if (!user) return;
    try {
      setDataLoading(true);
      const res = await fetch(`/api/customer/appointments?customerId=${user.uid}`);
      if (res.ok) {
        const data = await res.json();
        setAppointments(data.appointments || []);
      }
    } catch (err) {
      console.error("Error loading customer appointments:", err);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadAppointments();
    }
  }, [user]);

  const handleCancelAppointment = async (appointmentId: string) => {
    const confirmCancel = confirm("Are you sure you want to cancel this grooming appointment?");
    if (!confirmCancel) return;

    try {
      const res = await fetch("/api/appointments/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentId,
          newStatus: "cancelled",
          reason: "Cancelled by student from dashboard",
          updatedBy: user?.uid,
        }),
      });

      if (res.ok) {
        await loadAppointments();
      }
    } catch (err) {
      alert("Failed to cancel appointment. Please contact vendor directly.");
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewAppt || !user) return;

    try {
      setReviewSubmitting(true);
      setReviewMsg("");

      const res = await fetch("/api/reviews/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentId: reviewAppt.appointmentId,
          customerId: user.uid,
          customerName: profile?.fullName || "UCC Student",
          vendorId: reviewAppt.vendorId,
          rating,
          comment,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit review");
      }

      setReviewMsg("Review posted successfully! Thank you for supporting campus groomers.");
      setTimeout(() => {
        setReviewAppt(null);
        setReviewMsg("");
        setComment("");
        setRating(5);
      }, 1500);
    } catch (err: any) {
      setReviewMsg(err.message || "Failed to submit review");
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <div className="w-8 h-8 border-2 border-[#c59b27] border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-sm text-[#8a8479] mt-3">Loading student portal...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white border border-[#ede8e1] rounded-3xl text-center space-y-5 shadow-xs">
        <div className="w-14 h-14 rounded-2xl bg-[#fdfbf7] border border-[#ede8e1] text-[#c59b27] flex items-center justify-center mx-auto">
          <Scissors className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-[#1c1b18]">Student Account Required</h2>
          <p className="text-xs text-[#736e65]">
            Please sign in to track your campus grooming appointments, receipts, and write verified reviews.
          </p>
        </div>
        <div className="pt-2 flex flex-col gap-2.5">
          <button
            onClick={() => router.push("/auth/login?redirect=/customer/dashboard")}
            className="w-full py-3 px-4 rounded-xl bg-[#1c1b18] text-white text-xs font-bold hover:bg-[#2d2b27] transition-all shadow-xs"
          >
            Sign In with Email
          </button>
          <button
            onClick={() => router.push("/auth/register")}
            className="w-full py-3 px-4 rounded-xl border border-[#ede8e1] text-[#4a4742] text-xs font-semibold hover:bg-[#f4efe8] transition-all"
          >
            Create New Account
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

  const upcomingAppointments = appointments.filter((a) =>
    ["pending", "confirmed", "in_progress"].includes(a.bookingStatus)
  );

  const pastAppointments = appointments.filter((a) =>
    ["completed", "cancelled", "rejected"].includes(a.bookingStatus)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header Profile Greeting */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#ede8e1] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#c59b27]">
            Student Grooming Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1c1b18] tracking-tight">
            Hello, {profile?.fullName || user.email?.split("@")[0]}
          </h1>
          <p className="text-xs sm:text-sm text-[#736e65] mt-1">
            Track your upcoming haircuts, appointment receipts, and leave verified reviews.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2.5 rounded-xl bg-[#1c1b18] text-white text-xs font-semibold hover:bg-[#2e2c28] transition-colors"
          >
            Book New Haircut / Style
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-3 border-b border-[#ede8e1] pb-3">
        <button
          onClick={() => setActiveTab("upcoming")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center space-x-1.5 ${
            activeTab === "upcoming"
              ? "bg-[#1c1b18] text-white"
              : "text-[#736e65] hover:text-[#1c1b18] hover:bg-[#f4efe8]"
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Active Bookings ({upcomingAppointments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center space-x-1.5 ${
            activeTab === "history"
              ? "bg-[#1c1b18] text-white"
              : "text-[#736e65] hover:text-[#1c1b18] hover:bg-[#f4efe8]"
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Past Sessions & Receipts ({pastAppointments.length})</span>
        </button>
      </div>

      {/* Content */}
      {dataLoading ? (
        <div className="py-20 text-center text-xs text-[#8a8479]">
          Loading your appointments from Firestore...
        </div>
      ) : activeTab === "upcoming" ? (
        upcomingAppointments.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#ede8e1] p-12 text-center space-y-3">
            <Scissors className="w-10 h-10 text-[#8a8479] mx-auto opacity-40" />
            <h3 className="font-bold text-base text-[#1c1b18]">No active bookings</h3>
            <p className="text-xs text-[#736e65] max-w-sm mx-auto">
              You don&apos;t have any upcoming haircut or styling appointments. Explore top campus barbers now!
            </p>
            <button
              onClick={() => router.push("/")}
              className="px-4 py-2 rounded-xl bg-[#1c1b18] text-white text-xs font-semibold"
            >
              Browse Campus Salons
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {upcomingAppointments.map((appt) => (
              <div
                key={appt.appointmentId}
                className="bg-white rounded-2xl border border-[#ede8e1] p-6 shadow-xs flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Link
                      href={`/vendor/${appt.vendorId}`}
                      className="text-xs font-bold text-[#c59b27] hover:underline"
                    >
                      {appt.vendorName || "Campus Studio"}
                    </Link>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        appt.bookingStatus === "confirmed"
                          ? "bg-emerald-100 text-emerald-800"
                          : appt.bookingStatus === "in_progress"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {appt.bookingStatus.replace("_", " ")}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-[#1c1b18]">
                      {appt.serviceNameSnapshot}
                    </h3>
                    <div className="text-xs text-[#736e65] flex items-center space-x-3 mt-1">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5 text-[#c59b27]" />
                        <span>{appt.appointmentDate}</span>
                      </span>
                      <span className="flex items-center space-x-1 font-semibold text-[#1c1b18]">
                        <Clock className="w-3.5 h-3.5 text-[#c59b27]" />
                        <span>{appt.startTime} - {appt.endTime}</span>
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-[#fdfbf7] rounded-xl border border-[#ede8e1] flex items-center justify-between text-xs">
                    <div>
                      <div className="text-[#8a8479]">Agreed Price</div>
                      <div className="font-bold text-[#1c1b18]">{formatGHS(appt.agreedPrice)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[#8a8479]">Payment</div>
                      <div className="font-semibold text-[#1c1b18]">
                        {appt.paymentMethod === "pay_at_shop" ? "Pay at Shop" : "Online MoMo / Card"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#ede8e1] flex items-center justify-between">
                  <span className="text-[11px] text-[#8a8479]">
                    Show up 5 mins before slot
                  </span>
                  <button
                    onClick={() => handleCancelAppointment(appt.appointmentId)}
                    className="text-xs font-semibold text-rose-600 hover:text-rose-700"
                  >
                    Cancel Booking
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        pastAppointments.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#ede8e1] p-12 text-center text-xs text-[#8a8479]">
            No past appointment history.
          </div>
        ) : (
          <div className="space-y-3">
            {pastAppointments.map((appt) => (
              <div
                key={appt.appointmentId}
                className="bg-white rounded-2xl border border-[#ede8e1] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-sm text-[#1c1b18]">
                      {appt.serviceNameSnapshot}
                    </h3>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                        appt.bookingStatus === "completed"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-stone-100 text-stone-600"
                      }`}
                    >
                      {appt.bookingStatus}
                    </span>
                  </div>
                  <div className="text-xs text-[#736e65]">
                    {appt.vendorName} • {appt.appointmentDate} at {appt.startTime} • {formatGHS(appt.agreedPrice)}
                  </div>
                </div>

                {appt.bookingStatus === "completed" && (
                  <button
                    onClick={() => {
                      setReviewAppt(appt);
                      setReviewMsg("");
                      setComment("");
                    }}
                    className="px-4 py-2 rounded-xl bg-[#ede8df] hover:bg-[#eae4dc] text-[#1c1b18] text-xs font-semibold flex items-center space-x-1.5 shrink-0 transition-colors"
                  >
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>Leave Verified Review</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        )
      )}

      {/* VERIFIED REVIEW MODAL */}
      {reviewAppt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 relative border border-[#ede8e1] shadow-2xl">
            <button
              onClick={() => setReviewAppt(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-[#8a8479] hover:text-[#1c1b18]"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#c59b27]">
                Verified Review
              </span>
              <h3 className="text-xl font-bold text-[#1c1b18]">
                Rate Your Experience
              </h3>
              <p className="text-xs text-[#736e65] mt-0.5">
                {reviewAppt.serviceNameSnapshot} at {reviewAppt.vendorName}
              </p>
            </div>

            {reviewMsg && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold ${
                  reviewMsg.includes("successfully")
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-rose-50 text-rose-800 border border-rose-200"
                }`}
              >
                {reviewMsg}
              </div>
            )}

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#4a4742]">
                  Rating (1 to 5 Stars)
                </label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setRating(s)}
                      className="p-1.5 focus:outline-none"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          s <= rating
                            ? "text-amber-500 fill-amber-500"
                            : "text-[#ede8e1]"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#4a4742]">
                  Your Comment / Feedback
                </label>
                <textarea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="How was the haircut, hygiene, punctuality, and vibe?"
                  className="w-full p-3 rounded-xl border border-[#ede8e1] text-xs focus:outline-none focus:ring-1 focus:ring-[#c59b27]"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={reviewSubmitting}
                className="w-full py-3 rounded-xl bg-[#1c1b18] text-white font-bold text-xs disabled:opacity-50 transition-all flex items-center justify-center space-x-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{reviewSubmitting ? "Submitting..." : "Post Verified Review"}</span>
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
