import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-11-17.clover",
});

export async function POST(req: Request) {
    try {
        const { email, name, phone, orderId, amount, orderItems } = await req.json();

        if (!email || !name || !phone || !orderId || !amount || orderItems.length === 0) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const line_items = orderItems.map((item: any) => ({
            price_data: {
                currency: "usd",
                product_data: {
                    name: item.name,
                    images: item.image ? [item.image] : undefined,
                },
                unit_amount: item.price * 100,
            },
            quantity: item.quantity,
        }));

        const session = await stripe.checkout.sessions.create({
            mode: "payment",
            line_items,
            customer_email: email,
            metadata: { name, phone, orderId },
            success_url: `${process.env.NEXT_PUBLIC_URL}/payment-success?order=${orderId}&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_URL}/payment-cancelled?order=${orderId}`,
        });


        return NextResponse.json({ url: session.url });
    } catch (error: any) {
        console.error("Stripe Session Error:", error);
        return NextResponse.json({ error: error.message || "Stripe Error" }, { status: 500 });
    }
}
