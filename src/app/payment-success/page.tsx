"use client";

import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function PaymentSuccess() {
    const params = useSearchParams();
    const sessionId = params.get("session_id");
    const orderId = params.get("order");

    const [verifying, setVerifying] = useState(true);
    const [verified, setVerified] = useState(false);

    useEffect(() => {
        const verifyStripePayment = async () => {
            if (!sessionId) {
                toast.error("Missing session ID");
                setVerifying(false);
                return;
            }

            try {
                const res = await fetch(`/api/stripe/verify-session?session_id=${sessionId}`);

                const data = await res.json();

                if (!res.ok) {
                    toast.error(data.error || "Payment verification failed");
                    setVerifying(false);
                    return;
                }

                toast.success("Payment verified successfully!");
                setVerified(true);
            } catch (err) {
                toast.error("Failed to verify Stripe payment");
            } finally {
                setVerifying(false);
            }
        };

        verifyStripePayment();
    }, [sessionId]);

    return (
        <div className="w-full flex items-center justify-center  p-6 ">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="bg-white  rounded-2xl p-10 max-w-md text-center"
            >
                {verifying ? (
                    <>
                        {/* Loading Animation */}
                        <motion.div
                            initial={{ rotate: 0 }}
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                            className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full mx-auto mb-6"
                        ></motion.div>

                        <h1 className="text-xl font-semibold text-gray-700">
                            Verifying Payment...
                        </h1>
                        <p className="text-gray-500 mt-2 text-sm">
                            Please wait while we confirm your transaction.
                        </p>
                    </>
                ) : verified ? (
                    <>
                        {/* Success Animation */}
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, delay: 0.2 }} className="flex justify-center mb-6" >
                            <CheckCircle className="text-red-500" size={80} />
                        </motion.div>

                        <h1 className="text-2xl font-bold text-gray-800">Payment Successful!</h1>
                        <p className="text-gray-600 mt-2">Thank you for your purchase.</p>

                        {orderId && (
                            <div className="mt-4 text-gray-700 font-medium bg-gray-100 p-3 rounded-lg">
                                Order ID: <span className="font-semibold">{orderId}</span>
                            </div>
                        )}

                        <motion.a
                            href="/"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.97 }}
                            className="mt-8 inline-block bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-xl font-semibold shadow-md"
                        >
                            Continue Shopping
                        </motion.a>
                    </>
                ) : (
                    <>
                        {/* Verification Failed */}
                        <h1 className="text-2xl font-bold text-red-600">Verification Failed</h1>
                        <p className="text-gray-600 mt-2">
                            We could not confirm your payment. Please contact support.
                        </p>

                        <motion.a
                            href="/"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.97 }}
                            className="mt-8 inline-block bg-gray-700 hover:bg-gray-800 text-white py-3 px-6 rounded-xl font-semibold shadow-md"
                        >
                            Go Back
                        </motion.a>
                    </>
                )}
            </motion.div>
        </div>
    );
}
