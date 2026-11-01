import { NextRequest, NextResponse } from 'next/server';
import { capturePayPalOrder } from '@/lib/paypal';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const orderId = String(body.orderId || '');
    if (!orderId) return NextResponse.json({ success: false, error: 'orderId is required' }, { status: 400 });
    const capture = await capturePayPalOrder(orderId);
    const unit = capture.purchase_units?.[0];
    const captured = unit?.payments?.captures?.find((item: any) => item.status === 'COMPLETED');
    const amountUSD = Number(captured?.amount?.value);
    const currency = captured?.amount?.currency_code;
    if (!captured || !Number.isFinite(amountUSD) || !currency) return NextResponse.json({ success: false, error: 'PayPal capture details could not be verified' }, { status: 502 });
    if (body.expectedAmountUSD != null && Math.abs(amountUSD - Number(body.expectedAmountUSD)) > 0.01) return NextResponse.json({ success: false, error: 'Captured amount does not match the approved order' }, { status: 409 });
    if (body.expectedCurrency && currency !== body.expectedCurrency) return NextResponse.json({ success: false, error: 'Captured currency does not match the expected currency' }, { status: 409 });
    if (isSupabaseConfigured() && supabaseAdmin) {
      const { error } = await supabaseAdmin.from('bookings').insert([{ order_id: orderId, title: String(body.title || 'PayNGo booking'), destination: String(body.destination || ''), traveler_name: String(body.travelerName || ''), traveler_email: String(body.travelerEmail || ''), amount_usd: amountUSD, currency, status: 'COMPLETED', payment_method: 'PayPal Orders API v2', metadata: { paypal_capture_id: captured.id } }]);
      if (error) console.error('Booking persistence failed after verified payment:', error.message);
    }
    return NextResponse.json({ success: true, status: 'COMPLETED', orderId, captureId: captured.id, amount: amountUSD, currency });
  } catch (error) { return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'PayPal capture failed' }, { status: 502 }); }
}
