import { NextResponse } from "next/server";
import Stripe from "stripe";
import prisma from "@/lib/PrismaClient";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-11-17.clover",
});

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const sessionId = searchParams.get("session_id");

        if (!sessionId) {
            return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
        }

        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (!session) {
            return NextResponse.json({ error: "Invalid session" }, { status: 404 });
        }

        const orderId = session.metadata?.orderId;
        if (!orderId) {
            return NextResponse.json({ error: "Missing orderId in metadata" }, { status: 400 });
        }

        if (session.payment_status !== "paid") {
            return NextResponse.json({ error: "Payment not completed" }, { status: 400 });
        }

        const order = await prisma.order.update({
            where: { id: Number(orderId) },
            data: {
                status: "paid",
                reference: "Stripe_payment",
            },
        });

        return NextResponse.json({ message: "Stripe Payment Verified", order });

    } catch (error) {
        console.error("Stripe verify error:", error);
        return NextResponse.json({ error: "Failed to verify Stripe payment" }, { status: 500 });
    }
}
