import { NextRequest, NextResponse } from 'next/server';
import { searchOpenStreetMapPlaces } from '@/lib/travel-integrations';
export const dynamic = 'force-dynamic';
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') || req.nextUrl.searchParams.get('city') || '';
  const category = req.nextUrl.searchParams.get('category') || 'all';
  try { const places = await searchOpenStreetMapPlaces(q, category, Number(req.nextUrl.searchParams.get('limit') || 10)); return NextResponse.json({ success: true, query: q, source: 'OpenStreetMap', places }); }
  catch (error) { return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Place search failed', places: [] }, { status: 503 }); }
}
