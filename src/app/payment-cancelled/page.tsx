"use client";

import { motion } from "framer-motion";
import { XCircle } from "lucide-react";
import Link from "next/link";

export default function PaymentFailed() {
    return (
        <div className=" flex items-center justify-center  p-6">
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white px-10 py-12 rounded-2xl  text-center max-w-md w-full"
            >
                {/* Animated red circle */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 180, delay: 0.2 }}
                    className="flex items-center justify-center mb-6"
                >
                    <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center">
                        <XCircle className="w-14 h-14 text-red-500" />
                    </div>
                </motion.div>

                <h1 className="text-3xl font-bold text-red-600">
                    Payment Failed
                </h1>

                <p className="text-gray-600 mt-3">
                    Unfortunately, your payment could not be completed.
                    <br /> Please try again or use a different payment method.
                </p>

                <div className="mt-8 flex flex-col gap-4">


                    <Link
                        href="/"
                        className="w-full py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition"
                    >
                        Go Home
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
