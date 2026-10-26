'use client';

import React, { useEffect, useRef } from 'react';

export interface CityLocation {
  city: string;
  state: string;
  country?: string;
  latitude: number;
  longitude: number;
}

interface RouteMapProps {
  pickup: CityLocation | null;
  destination: CityLocation | null;
  routeGeoJSON: any | null;
  className?: string;
}

export default function RouteMap({
  pickup,
  destination,
  routeGeoJSON,
  className = '',
}: RouteMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const pickupMarkerRef = useRef<any>(null);
  const destinationMarkerRef = useRef<any>(null);
  const initialMarkerRef = useRef<any>(null);
  const routeLayerRef = useRef<any>(null);

  // Initialize Leaflet Map
  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (!mapContainerRef.current) return;
      if (mapInstanceRef.current) return;

      const L = (await import('leaflet')).default;
      if (!isMounted || !mapContainerRef.current) return;

      // Fix default marker icon paths in webpack/Next.js
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      // Step 2: Initialize map centered on Hyderabad [17.385, 78.4867], zoom 6
      const map = L.map(mapContainerRef.current, {
        center: [17.385, 78.4867],
        zoom: 6,
        scrollWheelZoom: true,
      });

      // Free OpenStreetMap tiles
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
      }).addTo(map);

      // Step 2 initial marker on Hyderabad
      const initialMarker = L.marker([17.385, 78.4867])
        .addTo(map)
        .bindPopup('<b>Hyderabad, Telangana</b><br/><span style="font-size:11px;color:#64748b;">Central Hub</span>');

      initialMarkerRef.current = initialMarker;
      mapInstanceRef.current = map;
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers & Bounds when pickup/destination change
  useEffect(() => {
    async function updateMarkers() {
      if (!mapInstanceRef.current) return;
      const L = (await import('leaflet')).default;
      const map = mapInstanceRef.current;

      // Custom high-contrast SVG divIcons
      const pickupIcon = L.divIcon({
        className: 'custom-pickup-marker',
        html: `
          <div style="background-color: #10b981; width: 34px; height: 34px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 13px;">
            A
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
        popupAnchor: [0, -20],
      });

      const destIcon = L.divIcon({
        className: 'custom-dest-marker',
        html: `
          <div style="background-color: #2563eb; width: 34px; height: 34px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 13px;">
            B
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
        popupAnchor: [0, -20],
      });

      // Remove initial marker once user has selected pickup/destination
      if ((pickup || destination) && initialMarkerRef.current) {
        map.removeLayer(initialMarkerRef.current);
        initialMarkerRef.current = null;
      }

      // Manage Pickup Marker
      if (pickup) {
        const pickupCoords: [number, number] = [pickup.latitude, pickup.longitude];
        if (pickupMarkerRef.current) {
          map.removeLayer(pickupMarkerRef.current);
        }
        pickupMarkerRef.current = L.marker(pickupCoords, { icon: pickupIcon })
          .addTo(map)
          .bindPopup(`<b>Pickup: ${pickup.city}</b><br/><span style="font-size:11px;color:#64748b;">${pickup.state}, India</span>`);
      } else if (pickupMarkerRef.current) {
        map.removeLayer(pickupMarkerRef.current);
        pickupMarkerRef.current = null;
      }

      // Manage Destination Marker
      if (destination) {
        const destCoords: [number, number] = [destination.latitude, destination.longitude];
        if (destinationMarkerRef.current) {
          map.removeLayer(destinationMarkerRef.current);
        }
        destinationMarkerRef.current = L.marker(destCoords, { icon: destIcon })
          .addTo(map)
          .bindPopup(`<b>Destination: ${destination.city}</b><br/><span style="font-size:11px;color:#64748b;">${destination.state}, India</span>`);
      } else if (destinationMarkerRef.current) {
        map.removeLayer(destinationMarkerRef.current);
        destinationMarkerRef.current = null;
      }

      // Fit bounds if both pickup & destination exist and no route GeoJSON is overriding
      if (pickup && destination && !routeGeoJSON) {
        const bounds = L.latLngBounds(
          [pickup.latitude, pickup.longitude],
          [destination.latitude, destination.longitude]
        );
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
        if (pickupMarkerRef.current) pickupMarkerRef.current.openPopup();
      } else if (pickup && !destination) {
        map.setView([pickup.latitude, pickup.longitude], 10);
      } else if (destination && !pickup) {
        map.setView([destination.latitude, destination.longitude], 10);
      }
    }

    updateMarkers();
  }, [pickup, destination, routeGeoJSON]);

  // Update Route Polyline
  useEffect(() => {
    async function updateRoute() {
      if (!mapInstanceRef.current) return;
      const L = (await import('leaflet')).default;
      const map = mapInstanceRef.current;

      if (routeLayerRef.current) {
        map.removeLayer(routeLayerRef.current);
        routeLayerRef.current = null;
      }

      if (routeGeoJSON) {
        const layer = L.geoJSON(routeGeoJSON, {
          style: {
            color: '#2563eb',
            weight: 5,
            opacity: 0.85,
            lineJoin: 'round',
            lineCap: 'round',
          },
        }).addTo(map);

        routeLayerRef.current = layer;
        map.fitBounds(layer.getBounds(), { padding: [50, 50] });

        if (pickupMarkerRef.current) {
          pickupMarkerRef.current.openPopup();
        }
      }
    }

    updateRoute();
  }, [routeGeoJSON]);

  return (
    <div className={`relative w-full rounded-xl overflow-hidden ${className}`}>
      {/* Required map container with id="map" */}
      <div
        id="map"
        ref={mapContainerRef}
        style={{ width: '100%', height: '450px', borderRadius: '12px' }}
        className="w-full h-[450px] rounded-xl overflow-hidden border border-slate-200 shadow-sm z-0"
      />

      {/* Floating Map Legend (z-10 inside map, so modals at z-[9999] are always on top) */}
      <div className="absolute bottom-3 left-3 z-10 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm text-[11px] font-semibold text-slate-700 flex items-center space-x-3 pointer-events-none">
        <span className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
          <span>Pickup (A)</span>
        </span>
        <span className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block"></span>
          <span>Destination (B)</span>
        </span>
        {routeGeoJSON && (
          <span className="flex items-center space-x-1.5 text-blue-700">
            <span className="w-4 h-1 bg-blue-600 rounded-full inline-block"></span>
            <span>OSRM Road Route</span>
          </span>
        )}
      </div>
    </div>
  );
}
