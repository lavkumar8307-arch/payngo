import { NextRequest, NextResponse } from 'next/server';
import { searchLocationsLocal, normalizeText } from '@/lib/locationData';
import { LocationItem, SearchLocationsResponse } from '@/types/location';

export const dynamic = 'force-dynamic';

// Simple in-memory cache to prevent duplicate remote geocoding calls
const cache = new Map<string, { data: LocationItem[]; timestamp: number }>();
const CACHE_TTL_MS = 1000 * 60 * 15; // 15 minutes

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    const normQ = normalizeText(query);

    // 1. First search local indexed dataset (Immediate & fast)
    const localResults = searchLocationsLocal(query, limit);

    // If query is empty or local results are sufficient (>= 3), return local results immediately
    if (!normQ || localResults.length >= 3) {
      const resp: SearchLocationsResponse = {
        success: true,
        query,
        results: localResults.slice(0, limit),
        total: localResults.length,
        source: 'local',
      };
      return NextResponse.json(resp);
    }

    // Check in-memory cache for remote query
    const cacheKey = `nominatim:${normQ}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      const combined = [...localResults, ...cached.data];
      const deduplicated = Array.from(
        new Map(combined.map((item) => [item.normalizedName, item])).values()
      ).slice(0, limit);

      const resp: SearchLocationsResponse = {
        success: true,
        query,
        results: deduplicated,
        total: deduplicated.length,
        source: 'hybrid',
      };
      return NextResponse.json(resp);
    }

    // 2. Query OpenStreetMap Nominatim Geocoding API for fallback remote results
    let remoteItems: LocationItem[] = [];
    try {
      const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        query + ', India'
      )}&format=json&addressdetails=1&limit=5&countrycodes=in`;

      const remoteRes = await fetch(nominatimUrl, {
        headers: {
          'User-Agent': 'PayNGo-AI-Travel/1.0 (contact@payngo.com)',
          'Accept-Language': 'en',
        },
        signal: AbortSignal.timeout(3000), // 3-second timeout safety
      });

      if (remoteRes.ok) {
        const rawData = await remoteRes.json();
        remoteItems = rawData.map((item: any, idx: number) => {
          const stateName =
            item.address?.state || item.address?.state_district || 'India';
          return {
            id: `osm-${item.place_id || idx}`,
            name: item.display_name.split(',')[0],
            normalizedName: normalizeText(item.display_name.split(',')[0]),
            aliases: [normalizeText(item.display_name)],
            type: (item.type === 'city' || item.type === 'town'
              ? item.type
              : 'attraction') as any,
            state: stateName,
            countryCode: 'IN',
            latitude: parseFloat(item.lat),
            longitude: parseFloat(item.lon),
            description: item.display_name,
            popularity: 70,
            isRemote: true,
          };
        });

        // Store in cache
        cache.set(cacheKey, { data: remoteItems, timestamp: Date.now() });
      }
    } catch (err) {
      console.warn('Remote geocoding query failed (falling back to local):', err);
    }

    // 3. Combine & Deduplicate Local + Remote Results
    const combined = [...localResults, ...remoteItems];
    const deduplicated = Array.from(
      new Map(combined.map((item) => [item.name.toLowerCase(), item])).values()
    ).slice(0, limit);

    const resp: SearchLocationsResponse = {
      success: true,
      query,
      results: deduplicated,
      total: deduplicated.length,
      source: remoteItems.length > 0 ? 'hybrid' : 'local',
    };

    return NextResponse.json(resp);
  } catch (err: any) {
    console.error('Location search API error:', err);
    return NextResponse.json(
      {
        success: false,
        query: '',
        results: [],
        total: 0,
        source: 'local',
        error: err.message || 'Location search error',
      },
      { status: 500 }
    );
  }
}
