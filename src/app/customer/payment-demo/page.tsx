"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, CreditCard, ShieldCheck, Phone } from "lucide-react";
import { formatGHS } from "@/lib/utils/time";

function PaymentDemoContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const reference = searchParams.get("ref") || `DEMO_${Date.now()}`;
  const amount = Number(searchParams.get("amount") || 35);
  const appointmentId = searchParams.get("appointmentId") || "";

  const [channel, setChannel] = useState<"mtn" | "telecel" | "card">("mtn");
  const [phoneNumber, setPhoneNumber] = useState("024 123 4567");
  const [processing, setProcessing] = useState(false);
  const [completed, setCompleted] = useState(false);

  const handleSimulatePayment = async () => {
    try {
      setProcessing(true);
      const res = await fetch("/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reference,
          appointmentId,
        }),
      });

      if (res.ok) {
        setCompleted(true);
        setTimeout(() => {
          router.push("/customer/dashboard");
        }, 2000);
      }
    } catch (err) {
      alert("Payment simulation error");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-md w-full bg-white rounded-3xl border border-[#ede8e1] p-8 shadow-sm space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Paystack Ghana Sandbox Gateway</span>
        </div>
        <h1 className="text-xl font-extrabold text-[#1c1b18]">
          UCC Campus Checkout
        </h1>
        <p className="text-xs text-[#736e65]">
          Reference: <span className="font-mono text-[#1c1b18]">{reference}</span>
        </p>
      </div>

      <div className="p-4 rounded-2xl bg-[#fdfbf7] border border-[#ede8e1] text-center">
        <div className="text-xs text-[#8a8479]">Amount Due</div>
        <div className="text-3xl font-black text-[#1c1b18] mt-1">
          {formatGHS(amount)}
        </div>
      </div>

      {completed ? (
        <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
          <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
          <h3 className="font-bold text-base text-emerald-900">
            Payment Confirmed!
          </h3>
          <p className="text-xs text-emerald-700">
            Your appointment is now confirmed and recorded in Firestore. Redirecting to your dashboard...
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#4a4742]">Select Payment Channel</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setChannel("mtn")}
                className={`p-3 rounded-xl border text-center transition-all ${
                  channel === "mtn"
                    ? "bg-[#1c1b18] text-white border-[#1c1b18]"
                    : "bg-[#fdfbf7] text-[#4a4742] border-[#ede8e1]"
                }`}
              >
                <div className="font-bold text-xs">MTN MoMo</div>
              </button>
              <button
                type="button"
                onClick={() => setChannel("telecel")}
                className={`p-3 rounded-xl border text-center transition-all ${
                  channel === "telecel"
                    ? "bg-[#1c1b18] text-white border-[#1c1b18]"
                    : "bg-[#fdfbf7] text-[#4a4742] border-[#ede8e1]"
                }`}
              >
                <div className="font-bold text-xs">Telecel Cash</div>
              </button>
              <button
                type="button"
                onClick={() => setChannel("card")}
                className={`p-3 rounded-xl border text-center transition-all ${
                  channel === "card"
                    ? "bg-[#1c1b18] text-white border-[#1c1b18]"
                    : "bg-[#fdfbf7] text-[#4a4742] border-[#ede8e1]"
                }`}
              >
                <div className="font-bold text-xs">Bank Card</div>
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#4a4742]">
              {channel === "card" ? "Cardholder Name" : "Mobile Money Number"}
            </label>
            <div className="flex items-center px-3 py-2.5 rounded-xl border border-[#ede8e1] bg-[#fdfbf7]">
              <Phone className="w-4 h-4 text-[#8a8479] mr-2" />
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full bg-transparent text-xs text-[#1c1b18] focus:outline-none"
              />
            </div>
          </div>

          <button
            onClick={handleSimulatePayment}
            disabled={processing}
            className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs disabled:opacity-50 transition-all flex items-center justify-center space-x-2 shadow-sm"
          >
            <CreditCard className="w-4 h-4" />
            <span>{processing ? "Authorizing MoMo Prompt..." : `Authorize Pay ${formatGHS(amount)}`}</span>
          </button>

          <p className="text-[11px] text-[#8a8479] text-center leading-relaxed">
            In test mode, clicking authorize simulates a successful Mobile Money push prompt and updates Firestore status.
          </p>
        </div>
      )}
    </div>
  );
}

export default function PaymentDemoPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <Suspense fallback={<div className="text-xs text-[#8a8479]">Loading checkout...</div>}>
        <PaymentDemoContent />
      </Suspense>
    </div>
  );
}
