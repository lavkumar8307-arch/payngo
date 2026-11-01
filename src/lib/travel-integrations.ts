export type PlaceSearchResult = {
  id: string; name: string; category: string; address: string;
  lat: number; lng: number; source: 'OpenStreetMap';
};

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];

export async function searchOpenStreetMapPlaces(query: string, category = 'all', limit = 10): Promise<PlaceSearchResult[]> {
  const text = query.trim();
  if (!text) throw new Error('A place or city query is required');
  const geoUrl = new URL('https://nominatim.openstreetmap.org/search');
  geoUrl.searchParams.set('q', text);
  geoUrl.searchParams.set('format', 'jsonv2');
  geoUrl.searchParams.set('limit', '1');
  const geoRes = await fetch(geoUrl, { headers: { 'User-Agent': 'PayNGoTravelApp/1.0 (location search)' }, cache: 'no-store' });
  if (!geoRes.ok) throw new Error('Location lookup is temporarily unavailable');
  const geo = await geoRes.json();
  if (!Array.isArray(geo) || !geo[0]) return [];
  const lat = Number(geo[0].lat), lon = Number(geo[0].lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return [];
  const selector = category === 'food'
    ? 'node[amenity~"restaurant|cafe|fast_food|food_court"](around:6000,LAT,LON);way[amenity~"restaurant|cafe|fast_food|food_court"](around:6000,LAT,LON);'
    : category === 'hotel'
    ? 'node[tourism~"hotel|hostel|guest_house"](around:6000,LAT,LON);way[tourism~"hotel|hostel|guest_house"](around:6000,LAT,LON);'
    : category === 'activity'
    ? 'node[tourism~"attraction|museum|artwork"](around:6000,LAT,LON);way[tourism~"attraction|museum|artwork"](around:6000,LAT,LON);'
    : 'node[amenity~"restaurant|cafe|fast_food"](around:6000,LAT,LON);node[tourism~"attraction|museum|hotel|hostel"](around:6000,LAT,LON);way[tourism~"attraction|museum|hotel|hostel"](around:6000,LAT,LON);';
  const overpass = '[out:json][timeout:20];(' + selector.replaceAll('LAT', String(lat)).replaceAll('LON', String(lon)) + ');out center tags ' + Math.min(Math.max(limit, 1), 25) + ';';
  let data: any = null;
  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: overpass, signal: AbortSignal.timeout(22000), cache: 'no-store' });
      if (res.ok) { data = await res.json(); break; }
    } catch { /* try the next public Overpass instance */ }
  }
  if (!data) throw new Error('Nearby place search is temporarily unavailable');
  return (data.elements || []).map((item: any) => {
    const tags = item.tags || {};
    const pLat = Number(item.lat ?? item.center?.lat), pLng = Number(item.lon ?? item.center?.lon);
    if (!Number.isFinite(pLat) || !Number.isFinite(pLng)) return null;
    return {
      id: 'osm-' + item.type + '-' + item.id,
      name: tags.name || tags.brand || tags.operator || 'Unnamed place',
      category: tags.amenity ? 'food' : tags.tourism === 'hotel' || tags.tourism === 'hostel' ? 'hotel' : 'activity',
      address: [tags['addr:housenumber'], tags['addr:street'], tags['addr:suburb'], tags['addr:city'] || tags['addr:town']].filter(Boolean).join(', ') || geo[0].display_name,
      lat: pLat, lng: pLng, source: 'OpenStreetMap' as const,
    };
  }).filter(Boolean).slice(0, limit);
}

export async function getRoadRoute(origin: { lat: number; lng: number }, destination: { lat: number; lng: number }) {
  for (const point of [origin, destination]) {
    if (!Number.isFinite(point.lat) || !Number.isFinite(point.lng) || Math.abs(point.lat) > 90 || Math.abs(point.lng) > 180) {
      throw new Error('Valid origin and destination coordinates are required');
    }
  }
  const url = 'https://router.project-osrm.org/route/v1/driving/' +
    encodeURIComponent(origin.lng + ',' + origin.lat) + ';' +
    encodeURIComponent(destination.lng + ',' + destination.lat) + '?overview=false&alternatives=false&steps=false';
  const response = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(12000) });
  if (!response.ok) throw new Error('Road route service is temporarily unavailable');
  const data = await response.json();
  const route = data.routes?.[0];
  if (!route || !Number.isFinite(route.distance) || !Number.isFinite(route.duration)) throw new Error('No drivable route was found');
  return { distanceKm: Math.round(route.distance / 100) / 10, durationMinutes: Math.ceil(route.duration / 60), source: 'OSRM road routing', estimateOnly: true };
}
