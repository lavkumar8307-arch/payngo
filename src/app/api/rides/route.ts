import { NextRequest, NextResponse } from 'next/server';
import { calculateFares } from '@/lib/fareEngine';
import { getRoadRoute } from '@/lib/travel-integrations';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const originLat = parseFloat(searchParams.get('originLat') || '');
  const originLng = parseFloat(searchParams.get('originLng') || '');
  const destLat = parseFloat(searchParams.get('destLat') || '');
  const destLng = parseFloat(searchParams.get('destLng') || '');
  const city = searchParams.get('city') || '';

  let distanceKm = parseFloat(searchParams.get('distance') || '');
  let routeInfo: { distanceKm: number; durationMinutes: number; source: string } | null = null;

  if (
    Number.isFinite(originLat) &&
    Number.isFinite(originLng) &&
    Number.isFinite(destLat) &&
    Number.isFinite(destLng)
  ) {
    try {
      routeInfo = await getRoadRoute(
        { lat: originLat, lng: originLng },
        { lat: destLat, lng: destLng }
      );
      distanceKm = routeInfo.distanceKm;
    } catch {
      if (!Number.isFinite(distanceKm) || distanceKm <= 0) {
        const R = 6371;
        const dLat = ((destLat - originLat) * Math.PI) / 180;
        const dLon = ((destLng - originLng) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((originLat * Math.PI) / 180) *
            Math.cos((destLat * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        distanceKm = Math.round(R * c * 1.25 * 10) / 10;
      }
    }
  }

  if (!Number.isFinite(distanceKm) || distanceKm <= 0) {
    distanceKm = 5.0;
  }

  const fares = calculateFares(distanceKm, 1.0, city);
  return NextResponse.json({
    success: true,
    distanceKm,
    durationMinutes: routeInfo?.durationMinutes,
    source: routeInfo?.source || 'Modelled Distance',
    fares,
  });
}
