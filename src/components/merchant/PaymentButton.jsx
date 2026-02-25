import React from "react";
import { toast } from "react-toastify";

export default function PaymentButton({ amount, onPaid }) {

  const handlePayment = () => {
    const confirmPay = window.confirm(`Pay ₹${amount} to farmer?`);
    if (!confirmPay) return;

    // Simulate payment success
    setTimeout(() => {
      toast.success("Payment Successful!");
      onPaid();
    }, 1000);
  };

  return (
    <button className="pay-btn" onClick={handlePayment}>
      Pay ₹{amount}
    </button>
  );
}
