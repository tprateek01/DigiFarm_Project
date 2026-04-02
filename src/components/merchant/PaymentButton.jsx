import React, { useState } from "react";

export default function PaymentButton({ amount, onPaid }) {
  const [processing, setProcessing] = useState(false);

  const handlePayment = async () => {
    if (processing) return;

    const confirmPay = window.confirm(`Pay ₹${amount} to farmer?`);
    if (!confirmPay) return;

    setProcessing(true);
    try {
      // onPaid() may be async; we support both sync and async callbacks.
      const maybePromise = onPaid?.();
      if (maybePromise && typeof maybePromise.then === "function") {
        await maybePromise;
      }
    } finally {
      setProcessing(false);
    }
  };

  return (
    <button
      className="pay-btn"
      onClick={handlePayment}
      disabled={processing}
      aria-busy={processing}
    >
      {processing ? `Processing...` : `Pay ₹${amount}`}
    </button>
  );
}
