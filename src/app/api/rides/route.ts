import { NextRequest, NextResponse } from 'next/server';
import { calculateFares } from '@/lib/fareEngine';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const distanceKm = parseFloat(searchParams.get('distance') || '2.5');

  const fares = calculateFares(distanceKm);
  return NextResponse.json({ success: true, distanceKm, fares });
}
