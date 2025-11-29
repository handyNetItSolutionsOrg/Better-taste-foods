"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";


interface CheckoutModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCartChange: (open: boolean) => void;
    cart: any[];
    totalPrice: number;
    clearCart: () => void;
}

export default function CheckoutModal({
                                          open,
                                          onOpenChange,
                                          onCartChange,
                                          cart,
                                          totalPrice,
                                          clearCart,
                                      }: CheckoutModalProps) {

    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        address: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };


    const createOrder = async () => {
        if (!form.name || !form.email || !form.phone || !form.address) {
            toast.error("Please fill in all fields");
            return null;
        }

        const res = await fetch("/api/orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...form, cart, total: totalPrice }),
        });

        if (!res.ok) {
            toast.error("Failed to create order");
            return null;
        }

        const order = await res.json();

        onOpenChange(false);
        onCartChange(false);

        return order;
    };



    const handlePayStack = async () => {
        const order = await createOrder();
        if (!order) return;

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        const PaystackPop = (await import("@paystack/inline-js")).default;
        const paystack = new PaystackPop();

        paystack.newTransaction({
            key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
            email: form.email,
            amount: totalPrice * 100,
            currency: "GHS",
            metadata: {
                name: form.name,
                phone: form.phone,
                orderId: order.id,
            },
            onSuccess: async (response: any) => {
                try {
                    await fetch(`/api/orders/${order.id}/verify`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ reference: response.reference }),
                    });
                    toast.success("Payment successful");
                    clearCart();
                    onOpenChange(false);
                } catch {
                    toast.error("Failed to verify payment");
                }
            },
            onCancel: () => {
                toast.info("Payment cancelled");
            },
        });
    };



    const handleStripe = async () => {
        const order = await createOrder();
        if (!order) return;

        try {
            const res = await fetch("/api/stripe/create-session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: form.email,
                    name: form.name,
                    phone: form.phone,
                    orderId: order.id,
                    amount: totalPrice * 100,
                    orderItems: cart.map(item => ({
                        name: item.name,
                        price: item.price,
                        quantity: item.quantity,
                        image: item.image,
                    })),
                }),
            });

            const data = await res.json();

            if (!res.ok || !data.url) {
                toast.error(data.error || "Stripe session creation failed");
                return;
            }

            // Open Stripe-hosted checkout page in a new tab
            window.open(data.url, "_blank");
            clearCart();

        } catch (err: any) {
            console.error("Stripe error:", err);
            toast.error("Failed to initialize Stripe payment");
        }
    };



    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md z-[700]">
                <DialogHeader>
                    <DialogTitle>Checkout</DialogTitle>
                </DialogHeader>

                <div className="space-y-3 mt-3 w-full">
                    <Input className="p-5" name="name" placeholder="Full Name" value={form.name} onChange={handleChange} />
                    <Input className="p-5" name="email" placeholder="Email" type="email" value={form.email} onChange={handleChange} />

                    <div className="flex w-full items-center gap-4">
                        <Input className="p-5" name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} />
                        <Input className="p-5" name="address" placeholder="Address" value={form.address} onChange={handleChange} />
                    </div>

                    <div className="mt-6 w-full border rounded-xl p-4 relative">
                        <div className="text-center text-gray-600 text-sm">Amount to Pay</div>
                        <div className="text-center text-3xl font-bold text-gray-900 mt-1">
                            GH₵{totalPrice.toFixed(2)}
                        </div>

                        <div className="mt-6 p-1 flex space-x-3 items-center justify-center">
                            <Button
                                className="w-1/2 p-5 rounded-lg bg-[#0D6EFD] hover:bg-[#0b5ed7] text-white text-lg font-semibold flex items-center justify-center shadow-md"
                                onClick={handlePayStack}
                            >
                                <svg width="22" height="22" viewBox="0 0 24 24">
                                    <rect width="24" height="24" rx="6" fill="white" />
                                    <path d="M4 7h16M4 12h10M4 17h7" stroke="#0D6EFD" strokeWidth="2" />
                                </svg>
                                Pay with Paystack
                            </Button>

                            <Button
                                className="w-1/2 p-5 rounded-lg bg-pink-600 hover:bg-pink-700 text-white text-lg font-semibold flex items-center justify-center shadow-md"
                                onClick={handleStripe}
                            >
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                                    <path
                                        d="M4 12c0-4.4 3.6-8 8-8s8 3.6 8 8-3.6 8-8 8"
                                        stroke="white"
                                        strokeWidth="2"
                                    />
                                    <text x="6.5" y="16" fontSize="8" fill="white" fontFamily="Arial">S</text>
                                </svg>
                                Pay with Stripe
                            </Button>
                        </div>
                    </div>

                    <div className="text-sm mt-5 text-gray-400 text-center">
                        Secure checkout - Protected and Encrypted
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
