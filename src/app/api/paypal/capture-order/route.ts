import { NextRequest, NextResponse } from 'next/server';
import { capturePayPalOrder } from '@/lib/paypal';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      orderId,
      title = 'PayNGo Experience',
      destination = 'Local Attraction',
      travelerName = 'Guest Traveler',
      travelerEmail = 'traveler@payngo.ai',
      amountUSD = 10.0,
      amountINR = 832.0,
      currency = 'USD',
    } = body;

    if (!orderId) {
      return NextResponse.json({ success: false, error: 'orderId is required' }, { status: 400 });
    }

    const captureData = await capturePayPalOrder(orderId);

    // Save to Supabase if configured
    if (isSupabaseConfigured() && supabaseAdmin) {
      try {
        await supabaseAdmin.from('bookings').insert([
          {
            order_id: orderId,
            title,
            destination,
            traveler_name: travelerName,
            traveler_email: travelerEmail,
            amount_inr: amountINR,
            amount_usd: amountUSD,
            currency,
            status: 'COMPLETED',
            payment_method: 'PayPal Orders API v2',
            qr_code_url: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${orderId}`,
            metadata: { paypal_capture: captureData },
          },
        ]);
      } catch (dbErr) {
        console.warn('Supabase order insert warning (non-blocking):', dbErr);
      }
    }

    return NextResponse.json({ success: true, capture: captureData });
  } catch (error: any) {
    console.error('PayPal Order Capture Failed:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to capture PayPal order' },
      { status: 500 }
    );
  }
}
