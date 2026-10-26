import { NextRequest, NextResponse } from 'next/server';
import { getPlacesForLocation } from '@/lib/mockData';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get('city') || 'All India';
  const category = searchParams.get('category') || 'all';

  const places = getPlacesForLocation(city, 20.5937, 78.9629, category);

  return NextResponse.json({ success: true, city, places });
}
