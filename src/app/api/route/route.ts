import { NextRequest, NextResponse } from 'next/server';
import { getRoadRoute } from '@/lib/travel-integrations';
export const dynamic = 'force-dynamic';
export async function POST(req: NextRequest) {
  try { const body = await req.json(); const route = await getRoadRoute(body.origin || {}, body.destination || {}); return NextResponse.json({ success: true, route }); }
  catch (error) { return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Route calculation failed' }, { status: 400 }); }
}
