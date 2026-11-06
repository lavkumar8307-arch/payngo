import { LocationState, POPULAR_LOCATIONS } from './mockData';

const LOCATION_CACHE_KEY = 'payngo_user_location';
const PROMPT_DISMISSED_KEY = 'payngo_location_prompt_dismissed';

/**
 * Get cached location from localStorage if available
 */
export function getSavedLocation(): LocationState | null {
  if (typeof window === 'undefined') return null;
  try {
    const saved = localStorage.getItem(LOCATION_CACHE_KEY);
    if (saved) {
      return JSON.parse(saved) as LocationState;
    }
  } catch (e) {
    console.warn('Failed to parse cached location:', e);
  }
  return null;
}

/**
 * Save user location to localStorage
 */
export function saveUserLocation(location: LocationState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify(location));
  } catch (e) {
    console.warn('Failed to save location to localStorage:', e);
  }
}

/**
 * Check if the user previously dismissed the location permission prompt
 */
export function isLocationPromptDismissed(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(PROMPT_DISMISSED_KEY) === 'true';
  } catch {
    return false;
  }
}

/**
 * Mark location permission prompt as dismissed
 */
export function dismissLocationPrompt(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PROMPT_DISMISSED_KEY, 'true');
  } catch {}
}

/**
 * Reset dismissed status so prompt can be shown again if user desires
 */
export function resetLocationPromptDismissed(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(PROMPT_DISMISSED_KEY);
  } catch {}
}

/**
 * Request real device GPS coordinates and reverse-geocode to city/state
 */
export async function detectLiveLocation(): Promise<LocationState> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      return reject(new Error('Geolocation is not supported by your browser.'));
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        let cityName = '';
        let stateName = '';

        try {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 4000);
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=14&addressdetails=1`,
            { signal: controller.signal, headers: { 'Accept-Language': 'en' } }
          );
          clearTimeout(timer);

          if (res.ok) {
            const data = await res.json();
            if (data?.address) {
              const rawCity =
                data.address.city ||
                data.address.town ||
                data.address.suburb ||
                data.address.neighbourhood ||
                data.address.village ||
                data.address.state_district;
              if (rawCity) {
                cityName = rawCity.replace(/\s+(mandal|district|taluk|tehsil)$/i, '').trim();
              }
              if (data.address.state) {
                stateName = data.address.state.trim();
              }
            }
          }
        } catch (e) {
          console.warn('Reverse geocode note:', e);
        }

        // Fallback: match nearest city from POPULAR_LOCATIONS
        if (!cityName || !stateName) {
          let closest = POPULAR_LOCATIONS[0];
          let minDist = Infinity;
          for (const loc of POPULAR_LOCATIONS) {
            if (loc.isGPS) continue;
            const dist = Math.hypot(loc.lat - latitude, loc.lng - longitude);
            if (dist < minDist) {
              minDist = dist;
              closest = loc;
            }
          }
          if (!cityName) cityName = closest.name.split(',')[0].trim();
          if (!stateName) stateName = closest.name.split(',')[1]?.trim() || 'India';
        }

        const fullName = `${cityName}, ${stateName}`;
        const liveLoc: LocationState = {
          id: 'live-gps',
          name: fullName,
          lat: latitude,
          lng: longitude,
          isGPS: true,
        };

        saveUserLocation(liveLoc);
        resolve(liveLoc);
      },
      (err) => {
        let msg = 'Failed to retrieve location.';
        if (err.code === err.PERMISSION_DENIED) {
          msg = 'Location permission was denied. Please allow location access in your browser settings.';
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          msg = 'Location information is currently unavailable.';
        } else if (err.code === err.TIMEOUT) {
          msg = 'Location request timed out.';
        }
        reject(new Error(msg));
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 }
    );
  });
}
