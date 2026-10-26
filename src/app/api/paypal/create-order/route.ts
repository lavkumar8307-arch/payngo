import { NextRequest, NextResponse } from 'next/server';
import { createPayPalOrder } from '@/lib/paypal';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amountUSD = 10.0, description = 'PayNGo Experience', placeName = 'Local Attraction' } = body;

    const order = await createPayPalOrder(amountUSD, description, placeName);
    return NextResponse.json({ success: true, orderId: order.id, details: order });
  } catch (error: any) {
    console.error('PayPal Order Creation Failed:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create PayPal order' },
      { status: 500 }
    );
  }
}
