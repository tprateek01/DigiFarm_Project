import React, { useState } from "react";
import { userApiService } from "../../api/userApi";
import { toast } from "react-toastify";

export default function PaymentButton({ amount, orderData, onSuccess, buttonText }) {
  const [processing, setProcessing] = useState(false);

  const handlePayment = async () => {
    if (processing) return;
    setProcessing(true);

    try {
      // 1. Create Razorpay Order on the backend
      const razorpayOrder = await userApiService.createRazorpayOrder(amount);
      
      if (!razorpayOrder || !razorpayOrder.id) {
        throw new Error("Failed to create Razorpay order");
      }

      // 2. Open Razorpay Checkout
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID || "rzp_test_SixvJvH7Nszr03", // Use env var or fallback to current key
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "DigiFarm",
        description: "Order Payment",
        order_id: razorpayOrder.id,
        handler: async function (response) {
          // 3. Verify Payment on the backend
          try {
            const verificationData = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              order_data: orderData, // This will be saved as the actual order on success
            };

            const result = await userApiService.verifyRazorpayPayment(verificationData);

            if (result.success) {
              toast.success("Payment successful and order placed!");
              if (onSuccess) onSuccess(result.order);
            } else {
              toast.error("Payment verification failed: " + result.message);
            }
          } catch (err) {
            console.error("Verification error:", err);
            toast.error("An error occurred during payment verification.");
          }
        },
        prefill: {
          name: orderData?.merchant_name || "",
          email: "merchant@digifarm.local", // Test email for better UPI visibility
          contact: "9999999999", // Test contact for better UPI visibility
        },
        config: {
          display: {
            blocks: {
              upi: {
                name: "Pay using UPI",
                instruments: [
                  {
                    method: "upi",
                  },
                ],
              },
            },
            sequence: ["block.upi"],
            preferences: {
              show_default_blocks: true,
            },
          },
        },
        theme: {
          color: "#2e7d32",
        },
        modal: {
          ondismiss: function() {
            setProcessing(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment initiation error:", error);
      toast.error("Failed to initiate payment. Please try again.");
      setProcessing(false);
    }
  };

  return (
    <button
      className="pay-btn"
      onClick={handlePayment}
      disabled={processing}
      style={{
        padding: '12px',
        borderRadius: '8px',
        border: 'none',
        backgroundColor: '#2e7d32',
        color: '#fff',
        fontWeight: 'bold',
        cursor: processing ? 'not-allowed' : 'pointer',
        width: '100%'
      }}
    >
      {processing ? "Processing..." : buttonText || `Pay ₹${amount}`}
    </button>
  );
}
