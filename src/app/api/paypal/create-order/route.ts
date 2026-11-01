import { NextRequest, NextResponse } from 'next/server';
import { createPayPalOrder } from '@/lib/paypal';
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const amountUSD = Number(body.amountUSD);
    if (!Number.isFinite(amountUSD) || amountUSD <= 0 || amountUSD > 100000) return NextResponse.json({ success: false, error: 'amountUSD must be a positive amount' }, { status: 400 });
    const description = String(body.description || 'PayNGo booking').slice(0, 100);
    const placeName = String(body.placeName || 'Travel booking').slice(0, 100);
    const order = await createPayPalOrder(amountUSD, description, placeName);
    const approvalUrl = order.links?.find((link: any) => link.rel === 'approve')?.href;
    return NextResponse.json({ success: true, orderId: order.id, status: order.status, approvalUrl });
  } catch (error) { return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'PayPal order creation failed' }, { status: 502 }); }
}
