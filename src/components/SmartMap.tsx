'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Place } from '@/types';
import { LocationState } from '@/lib/mockData';
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
} from 'lucide-react';

interface SmartMapProps {
  currentLocation: LocationState;
  places: Place[];
  selectedPlace: Place | null;
  onSelectPlace: (place: Place) => void;
  onOpenLocationPicker: () => void;
}

type MapTheme = 'streets' | 'satellite' | 'terrain' | 'osm';

export const SmartMap: React.FC<SmartMapProps> = ({
  currentLocation,
  places,
  selectedPlace,
  onSelectPlace,
  onOpenLocationPicker,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const routePolylineRef = useRef<any>(null);

  const [mapTheme, setMapTheme] = useState<MapTheme>('streets');
  const [isMapReady, setIsMapReady] = useState(false);

  // Free high-definition tile layers with NO API keys and NO watermarks
  const tileUrls = {
    streets: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    terrain: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    osm: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  };

  const tileAttributions = {
    streets: '&copy; Esri World Street Map',
    satellite: '&copy; Esri World Imagery',
    terrain: '&copy; Esri World Topo',
    osm: '&copy; OpenStreetMap contributors',
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

      // Add Base Tile Layer
      const baseLayer = L.tileLayer(tileUrls[mapTheme], {
        attribution: tileAttributions[mapTheme],
        maxZoom: 19,
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

  return (
    <div className="relative w-full h-[520px] rounded-3xl overflow-hidden border border-slate-200 shadow-xl bg-slate-100 group">
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Top Left Header Card Overlay */}
      <div className="absolute top-4 left-4 z-20 bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl p-2.5 sm:px-4 sm:py-2.5 shadow-lg flex items-center justify-between gap-3 max-w-xs sm:max-w-md">
        <div className="flex items-center space-x-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 border border-sky-100">
            {currentLocation.isGPS ? (
              <LocateFixed className="w-4 h-4 text-emerald-600 animate-pulse" />
            ) : (
              <Navigation className="w-4 h-4 text-sky-600" />
            )}
          </div>
          <div className="min-w-0">
            <h3 className="text-xs font-bold text-slate-900 truncate">
              {currentLocation.name}
            </h3>
            <p className="text-[10px] text-slate-500 font-medium truncate">
              {places.length} verified places ranked in radar
            </p>
          </div>
        </div>
        <button
          onClick={onOpenLocationPicker}
          className="bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 text-[10px] font-bold px-2.5 py-1 rounded-xl shrink-0 transition-all shadow-sm"
        >
          Change
        </button>
      </div>

      {/* Top Right Controls & Layer Switcher */}
      <div className="absolute top-4 right-4 z-20 flex flex-col items-end space-y-2">
        {/* Layer Switcher Pills */}
        <div className="bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl p-1 shadow-md flex items-center space-x-1">
          <button
            onClick={() => setMapTheme('streets')}
            className={`text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all ${mapTheme === 'streets'
                ? 'bg-neutral-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
          >
            Streets
          </button>
          <button
            onClick={() => setMapTheme('satellite')}
            className={`text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all ${mapTheme === 'satellite'
                ? 'bg-neutral-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
          >
            Satellite
          </button>
          <button
            onClick={() => setMapTheme('terrain')}
            className={`text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all ${mapTheme === 'terrain'
                ? 'bg-neutral-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
          >
            Terrain
          </button>
          <button
            onClick={() => setMapTheme('osm')}
            className={`text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all ${mapTheme === 'osm'
                ? 'bg-neutral-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
          >
            OSM
          </button>
        </div>

        {/* Zoom & Recenter Buttons */}
        <div className="bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl p-1 shadow-md flex flex-col space-y-1">
          <button
            onClick={handleZoomIn}
            className="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-700 flex items-center justify-center transition-all"
            title="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-700 flex items-center justify-center transition-all"
            title="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleRecenter}
            className="w-7 h-7 rounded-lg hover:bg-slate-100 text-sky-600 flex items-center justify-center transition-all border-t border-slate-100"
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
