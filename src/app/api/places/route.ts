import { NextRequest, NextResponse } from 'next/server';
import { getPlacesForLocation } from '@/lib/mockData';
import { searchOpenStreetMapPlaces } from '@/lib/travel-integrations';
export const dynamic = 'force-dynamic';
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get('city') || '';
  const category = searchParams.get('category') || 'all';
  const lat = Number(searchParams.get('lat'));
  const lng = Number(searchParams.get('lng'));
  if (!city.trim()) return NextResponse.json({ success: false, error: 'Provide a city or place query', places: [] }, { status: 400 });
  try {
    const coords = Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : undefined;
    const places = await searchOpenStreetMapPlaces(city, category, 12, coords);
    return NextResponse.json({ success: true, city, source: 'OpenStreetMap', places });
  } catch (error) {
    // Existing curated data is retained only as an explicitly labelled fallback.
    if (Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180) {
      const places = getPlacesForLocation(city, lat, lng, category);
      return NextResponse.json({ success: true, city, source: 'curated-fallback', warning: 'Live place search unavailable; showing curated sample data.', places });
    }
    return NextResponse.json({ success: false, city, source: 'unavailable', error: error instanceof Error ? error.message : 'Place search unavailable', places: [] }, { status: 503 });
  }
}
