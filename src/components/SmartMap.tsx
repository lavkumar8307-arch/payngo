'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Place } from '@/types';
import { LocationState } from '@/lib/mockData';
import { detectLiveLocation } from '@/lib/location';
import {
  Navigation,
  LocateFixed,
  Layers,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Compass,
  Star,
  ExternalLink,
  Loader2,
} from 'lucide-react';

interface SmartMapProps {
  currentLocation: LocationState;
  places: Place[];
  selectedPlace: Place | null;
  onSelectPlace: (place: Place) => void;
  onOpenLocationPicker: () => void;
  onLocationDetected?: (loc: LocationState) => void;
}

type MapTheme = 'streets' | 'satellite' | 'terrain' | 'osm';

export const SmartMap: React.FC<SmartMapProps> = ({
  currentLocation,
  places,
  selectedPlace,
  onSelectPlace,
  onOpenLocationPicker,
  onLocationDetected,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const routePolylineRef = useRef<any>(null);

  const [mapTheme, setMapTheme] = useState<MapTheme>('streets');
  const [isMapReady, setIsMapReady] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState<string | null>(null);

  // Free high-definition tile layers with NO API keys, NO watermarks, and reliable high-zoom coverage
  const tileUrls = {
    streets: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    osm: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    terrain: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
  };

  const tileAttributions = {
    streets: '&copy; OpenStreetMap contributors',
    osm: '&copy; OpenStreetMap contributors, Humanitarian style',
    satellite: '&copy; Esri World Imagery',
    terrain: '&copy; Esri World Topo',
  };

  // Initialize Map
  useEffect(() => {
    let isCancelled = false;

    const initMap = async () => {
      if (!mapContainerRef.current || mapInstanceRef.current) return;

      const L = await import('leaflet');
      if (isCancelled || !mapContainerRef.current) return;

      // Fix default marker icon issues in Leaflet with webpack/nextjs
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const initialLat = currentLocation.lat || 20.5937;
      const initialLng = currentLocation.lng || 78.9629;

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: 11,
        zoomControl: false,
        scrollWheelZoom: true,
        attributionControl: false,
      });

      // Add Base Tile Layer with maxNativeZoom to prevent high-zoom tile gaps or watermarks
      const baseLayer = L.tileLayer(tileUrls[mapTheme], {
        attribution: tileAttributions[mapTheme],
        maxZoom: 19,
        maxNativeZoom: mapTheme === 'satellite' || mapTheme === 'terrain' ? 17 : 19,
        subdomains: 'abc',
      }).addTo(map);

      tileLayerRef.current = baseLayer;

      // Create LayerGroup for markers
      const markersLayer = L.layerGroup().addTo(map);
      markersLayerRef.current = markersLayer;

      mapInstanceRef.current = map;
      setIsMapReady(true);
    };

    initMap();

    return () => {
      isCancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Tile Layer when mapTheme changes
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;

    import('leaflet').then((L) => {
      if (!mapInstanceRef.current) return;

      mapInstanceRef.current.removeLayer(tileLayerRef.current);
      const newLayer = L.tileLayer(tileUrls[mapTheme], {
        attribution: tileAttributions[mapTheme],
        maxZoom: 19,
        maxNativeZoom: mapTheme === 'satellite' || mapTheme === 'terrain' ? 17 : 19,
        subdomains: 'abc',
      }).addTo(mapInstanceRef.current);

      tileLayerRef.current = newLayer;
      newLayer.bringToBack();
    });
  }, [mapTheme]);

  // Update Markers and Fit Bounds when currentLocation, places, or selectedPlace change
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current || !isMapReady) return;

    import('leaflet').then((L) => {
      const map = mapInstanceRef.current;
      const markersLayer = markersLayerRef.current;
      if (!map || !markersLayer) return;

      markersLayer.clearLayers();

      if (routePolylineRef.current) {
        map.removeLayer(routePolylineRef.current);
        routePolylineRef.current = null;
      }

      const allCoordinates: [number, number][] = [];

      // 1. User Location Radar Marker
      if (currentLocation.lat && currentLocation.lng) {
        allCoordinates.push([currentLocation.lat, currentLocation.lng]);

        const userIcon = L.divIcon({
          className: 'custom-user-marker',
          html: `
            <div class="relative flex items-center justify-center w-10 h-10 -ml-5 -mt-5">
              <div class="absolute w-10 h-10 rounded-full bg-sky-500/30 animate-ping"></div>
              <div class="absolute w-7 h-7 rounded-full bg-sky-500/40 animate-pulse"></div>
              <div class="w-5 h-5 rounded-full bg-sky-600 border-2 border-white shadow-lg flex items-center justify-center text-white text-[10px] font-bold">
                ▲
              </div>
            </div>
          `,
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        });

        const userMarker = L.marker([currentLocation.lat, currentLocation.lng], {
          icon: userIcon,
          zIndexOffset: 1000,
        }).addTo(markersLayer);

        userMarker.bindTooltip(
          `<div class="font-bold text-xs text-slate-900">📍 You are here (${currentLocation.name})</div>`,
          { direction: 'top', offset: [0, -15], className: 'custom-leaflet-tooltip' }
        );
      }

      // 2. Place Markers
      places.forEach((place) => {
        if (!place.lat || !place.lng) return;
        allCoordinates.push([place.lat, place.lng]);

        const isSelected = selectedPlace?.id === place.id;
        const categoryEmoji =
          place.category === 'food' ? '🍜' : place.category === 'hotel' ? '🏨' : place.category === 'transit' ? '🚕' : '🏛️';

        const placeIcon = L.divIcon({
          className: 'custom-place-marker',
          html: `
            <div class="relative group cursor-pointer transition-all duration-300 ${isSelected ? 'scale-125 z-50' : 'hover:scale-110 z-20'
            }">
              <div class="flex items-center space-x-1 px-2.5 py-1 rounded-full shadow-lg border text-xs font-bold transition-all ${isSelected
              ? 'bg-neutral-950 text-white border-neutral-900 ring-4 ring-sky-400 shadow-xl'
              : 'bg-white text-slate-800 border-slate-200 hover:border-sky-400'
            }">
                <span>${categoryEmoji}</span>
                <span class="max-w-[90px] truncate">${place.name.split(',')[0]}</span>
                <span class="text-[10px] ${isSelected ? 'text-amber-300' : 'text-amber-500'}">★${place.rating}</span>
              </div>
              <div class="w-2 h-2 mx-auto rotate-45 -mt-1 ${isSelected ? 'bg-neutral-950' : 'bg-white border-r border-b border-slate-200'
            }"></div>
            </div>
          `,
          iconSize: [140, 40],
          iconAnchor: [70, 36],
        });

        const marker = L.marker([place.lat, place.lng], {
          icon: placeIcon,
          zIndexOffset: isSelected ? 500 : 100,
        }).addTo(markersLayer);

        marker.on('click', () => {
          onSelectPlace(place);
        });

        marker.bindTooltip(
          `
            <div class="p-1 space-y-0.5 text-slate-900">
              <p class="font-bold text-xs">${place.name}</p>
              <p class="text-[10px] text-slate-500">${place.distanceKm} km away • ${place.priceLevel}</p>
            </div>
          `,
          { direction: 'top', offset: [0, -25] }
        );
      });

      // 3. Draw Connecting Route Polyline between user and selected place
      if (
        selectedPlace &&
        selectedPlace.lat &&
        selectedPlace.lng &&
        currentLocation.lat &&
        currentLocation.lng
      ) {
        const polyline = L.polyline(
          [
            [currentLocation.lat, currentLocation.lng],
            [selectedPlace.lat, selectedPlace.lng],
          ],
          {
            color: '#0284c7',
            weight: 3.5,
            opacity: 0.85,
            dashArray: '8, 8',
            lineCap: 'round',
          }
        ).addTo(map);

        routePolylineRef.current = polyline;
      }

      // 4. Smart Fit Bounds
      if (allCoordinates.length > 0) {
        const bounds = L.latLngBounds(allCoordinates);
        map.flyToBounds(bounds, {
          padding: [50, 50],
          maxZoom: 13,
          duration: 1.2,
        });
      }
    });
  }, [currentLocation, places, selectedPlace, isMapReady]);

  // Map Controls Helpers
  const handleZoomIn = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomOut();
  };

  const handleRecenter = () => {
    if (mapInstanceRef.current && currentLocation.lat && currentLocation.lng) {
      mapInstanceRef.current.flyTo([currentLocation.lat, currentLocation.lng], 12, {
        duration: 1.2,
      });
    }
  };

  // Live Location Detection with Glassmorphic Button
  const handleDetectLiveLocation = async () => {
    setIsLocating(true);
    setLocationStatus(null);
    try {
      const loc = await detectLiveLocation();
      if (onLocationDetected) {
        onLocationDetected(loc);
      }
      if (mapInstanceRef.current && loc.lat && loc.lng) {
        mapInstanceRef.current.flyTo([loc.lat, loc.lng], 13, {
          duration: 1.5,
        });
      }
      const shortName = loc.name.split(',')[0].trim();
      setLocationStatus(`Live GPS locked: ${shortName}`);
      setTimeout(() => setLocationStatus(null), 3500);
    } catch (err: any) {
      console.warn('Live location error:', err);
      setLocationStatus(err.message || 'Permission denied in browser');
      setTimeout(() => setLocationStatus(null), 4000);
    } finally {
      setIsLocating(false);
    }
  };

  return (
    <div className="relative w-full h-[520px] rounded-3xl overflow-hidden border border-slate-200 shadow-xl bg-slate-900 group">
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Top Left: Grey & Black Glassmorphic Live Location Button & Header Bar */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2 max-w-[calc(100%-140px)] sm:max-w-xl">
        {/* Grey and Black Glassmorphic Live Location Button */}
        <button
          onClick={handleDetectLiveLocation}
          disabled={isLocating}
          className={`group/gps flex items-center space-x-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all shadow-xl backdrop-blur-xl border active:scale-95 cursor-pointer ${
            currentLocation.isGPS
              ? 'bg-neutral-900/90 hover:bg-black text-white border-emerald-500/60 shadow-emerald-950/40 ring-1 ring-emerald-500/30'
              : 'bg-neutral-900/85 hover:bg-neutral-950 text-slate-100 border-neutral-700/70 hover:border-neutral-500 shadow-black/60'
          }`}
          title="Click to detect your device live location"
        >
          {isLocating ? (
            <Loader2 className="w-4 h-4 text-sky-400 animate-spin" />
          ) : currentLocation.isGPS ? (
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          ) : (
            <LocateFixed className="w-4 h-4 text-sky-400 group-hover/gps:rotate-90 transition-transform duration-300" />
          )}

          <span className="tracking-tight">
            {isLocating
              ? 'Detecting GPS...'
              : currentLocation.isGPS
              ? 'Live Location'
              : 'Live Location'}
          </span>

          <span
            className={`text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider ${
              currentLocation.isGPS
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-neutral-800 text-slate-400 border border-neutral-700'
            }`}
          >
            {currentLocation.isGPS ? 'ACTIVE' : 'GPS'}
          </span>
        </button>

        {/* Current Location Badge with Matching Grey/Black Glassmorphism */}
        <div className="bg-neutral-900/85 hover:bg-neutral-900/95 backdrop-blur-xl border border-neutral-700/70 text-white rounded-2xl px-3 py-2 shadow-xl flex items-center space-x-2">
          <Navigation className="w-3.5 h-3.5 text-sky-400 shrink-0" />
          <span className="text-xs font-semibold text-slate-200 truncate max-w-[130px] sm:max-w-[190px]">
            {currentLocation.name}
          </span>
          <button
            onClick={onOpenLocationPicker}
            className="text-[10px] font-bold text-sky-400 hover:text-sky-300 shrink-0 ml-1 underline decoration-sky-400/40 hover:decoration-sky-300 underline-offset-2"
          >
            Change
          </button>
        </div>

        {/* Status Notification Toast */}
        {locationStatus && (
          <div className="bg-neutral-950/95 backdrop-blur-xl border border-neutral-700 text-slate-200 text-[11px] font-medium px-3 py-1.5 rounded-xl shadow-2xl animate-fade-in flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping" />
            <span>{locationStatus}</span>
          </div>
        )}
      </div>

      {/* Top Right Controls & Layer Switcher with Grey & Black Glassmorphism */}
      <div className="absolute top-4 right-4 z-20 flex flex-col items-end space-y-2">
        {/* Layer Switcher Pills */}
        <div className="bg-neutral-900/85 backdrop-blur-xl border border-neutral-700/70 rounded-2xl p-1 shadow-xl flex items-center space-x-1">
          {(['streets', 'satellite', 'terrain', 'osm'] as MapTheme[]).map((theme) => (
            <button
              key={theme}
              onClick={() => setMapTheme(theme)}
              className={`text-[10px] font-bold px-2.5 py-1 rounded-xl transition-all capitalize ${
                mapTheme === theme
                  ? 'bg-white text-neutral-950 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-neutral-800/80'
              }`}
            >
              {theme}
            </button>
          ))}
        </div>

        {/* Zoom & Recenter Buttons with Grey & Black Glassmorphism */}
        <div className="bg-neutral-900/85 backdrop-blur-xl border border-neutral-700/70 rounded-2xl p-1 shadow-xl flex flex-col space-y-1">
          <button
            onClick={handleZoomIn}
            className="w-7 h-7 rounded-xl hover:bg-neutral-800 text-slate-300 hover:text-white flex items-center justify-center transition-all"
            title="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="w-7 h-7 rounded-xl hover:bg-neutral-800 text-slate-300 hover:text-white flex items-center justify-center transition-all"
            title="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleRecenter}
            className="w-7 h-7 rounded-xl hover:bg-neutral-800 text-sky-400 hover:text-sky-300 flex items-center justify-center transition-all border-t border-neutral-800"
            title="Recenter on current location"
          >
            <LocateFixed className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Floating Selected Place Info Card Overlay */}
      {selectedPlace && (
        <div className="absolute bottom-4 left-4 right-4 z-20 bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl p-3.5 shadow-xl flex items-center justify-between animate-fade-in max-w-3xl mx-auto">
          <div className="flex items-center space-x-3.5 min-w-0">
            <img
              src={selectedPlace.imageUrl}
              alt={selectedPlace.name}
              className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0 shadow-md"
            />
            <div className="min-w-0">
              <div className="flex items-center space-x-2 flex-wrap">
                <h4 className="text-sm font-bold text-slate-900 truncate">
                  {selectedPlace.name}
                </h4>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                  {selectedPlace.newcomerScore}% Newcomer Score
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate mt-0.5 font-medium">
                {selectedPlace.address} •{' '}
                <span className="text-sky-600 font-bold">
                  {selectedPlace.distanceKm} km away
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={() => onSelectPlace(selectedPlace)}
            className="bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all shrink-0 ml-3 hover:shadow-lg active:scale-95"
          >
            Fares & PayPal Checkout
          </button>
        </div>
      )}
    </div>
  );
};
