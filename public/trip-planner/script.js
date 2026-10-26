// STEP 2 — Initialize Leaflet Map centered on Hyderabad
const map = L.map("map").setView([17.385, 78.4867], 6);

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
}).addTo(map);

// Default initial marker
let initialMarker = L.marker([17.385, 78.4867])
  .addTo(map)
  .bindPopup("<b>Hyderabad, Telangana</b><br>Central Hub")
  .openPopup();

// STEP 3 & STEP 4 — Locations data and Autocomplete
let locations = [];
let selectedPickup = null;
let selectedDestination = null;

// Fallback seed locations in case cities.json fails to load directly
const fallbackLocations = [
  { city: "Hyderabad", state: "Telangana", country: "India", latitude: 17.385, longitude: 78.4867 },
  { city: "Mumbai", state: "Maharashtra", country: "India", latitude: 19.076, longitude: 72.8777 },
  { city: "Jaipur", state: "Rajasthan", country: "India", latitude: 26.9124, longitude: 75.7873 },
  { city: "Panaji", state: "Goa", country: "India", latitude: 15.4909, longitude: 73.8278 },
  { city: "Bengaluru", state: "Karnataka", country: "India", latitude: 12.9716, longitude: 77.5946 },
  { city: "Delhi", state: "Delhi", country: "India", latitude: 28.6139, longitude: 77.2090 },
  { city: "Agra", state: "Uttar Pradesh", country: "India", latitude: 27.1767, longitude: 78.0081 },
  { city: "Kochi", state: "Kerala", country: "India", latitude: 9.9312, longitude: 76.2673 },
  { city: "Chennai", state: "Tamil Nadu", country: "India", latitude: 13.0827, longitude: 80.2707 },
  { city: "Kolkata", state: "West Bengal", country: "India", latitude: 22.5726, longitude: 88.3639 }
];

// Load cities.json
fetch("/cities.json")
  .then((response) => {
    if (!response.ok) {
      return fetch("./cities.json");
    }
    return response.json();
  })
  .then((data) => {
    locations = Array.isArray(data) && data.length > 0 ? data : fallbackLocations;
    console.log(`Loaded ${locations.length} locations successfully.`);
  })
  .catch((error) => {
    console.warn("Could not load external cities.json, using fallback locations:", error);
    locations = fallbackLocations;
  });

function setupSearch(inputId, resultsId, type) {
  const input = document.getElementById(inputId);
  const results = document.getElementById(resultsId);

  input.addEventListener("input", () => {
    const query = input.value.trim().toLowerCase();
    results.replaceChildren();

    if (type === "pickup") {
      selectedPickup = null;
    } else {
      selectedDestination = null;
    }

    if (query.length < 2) return;

    const matches = locations
      .filter((location) =>
        `${location.city}, ${location.state}, India`.toLowerCase().includes(query)
      )
      .slice(0, 8);

    matches.forEach((location) => {
      const option = document.createElement("div");
      option.textContent = `${location.city}, ${location.state}, India`;
      option.addEventListener("click", () => {
        input.value = option.textContent;
        results.replaceChildren();
        if (type === "pickup") {
          selectedPickup = location;
        } else {
          selectedDestination = location;
        }
      });
      results.appendChild(option);
    });
  });

  // Close results when clicking outside
  document.addEventListener("click", (e) => {
    if (!input.contains(e.target) && !results.contains(e.target)) {
      results.replaceChildren();
    }
  });
}

setupSearch("pickup", "pickup-results", "pickup");
setupSearch("destination", "destination-results", "destination");

// STEP 5 & STEP 6 — Show Selected Locations & Driving Route on Map
let pickupMarker = null;
let destinationMarker = null;
let routeLayer = null;

async function drawRoute(pickup, destination) {
  const url =
    `https://router.project-osrm.org/route/v1/driving/` +
    `${pickup.longitude},${pickup.latitude};` +
    `${destination.longitude},${destination.latitude}` +
    `?overview=full&geometries=geojson`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Could not calculate route.");
  }

  const data = await response.json();
  if (data.code !== "Ok" || !data.routes.length) {
    throw new Error("No driving route was found.");
  }

  const route = data.routes[0];

  if (routeLayer) {
    map.removeLayer(routeLayer);
  }

  routeLayer = L.geoJSON(route.geometry, {
    style: {
      color: "#2563eb",
      weight: 5,
      opacity: 0.85
    }
  }).addTo(map);

  map.fitBounds(routeLayer.getBounds(), { padding: [50, 50] });

  return {
    distanceKm: (route.distance / 1000).toFixed(1),
    durationMinutes: Math.round(route.duration / 60)
  };
}

// Show on Map click handler
document.getElementById("show-route").addEventListener("click", async () => {
  if (!selectedPickup || !selectedDestination) {
    alert("Please select both pickup and destination locations.");
    return;
  }

  // Remove initial marker if present
  if (initialMarker) {
    map.removeLayer(initialMarker);
    initialMarker = null;
  }

  if (pickupMarker) {
    map.removeLayer(pickupMarker);
  }
  if (destinationMarker) {
    map.removeLayer(destinationMarker);
  }

  const pickupCoords = [selectedPickup.latitude, selectedPickup.longitude];
  const destinationCoords = [selectedDestination.latitude, selectedDestination.longitude];

  pickupMarker = L.marker(pickupCoords)
    .addTo(map)
    .bindPopup("<b>Pickup:</b> " + selectedPickup.city + ", " + selectedPickup.state);

  destinationMarker = L.marker(destinationCoords)
    .addTo(map)
    .bindPopup("<b>Destination:</b> " + selectedDestination.city + ", " + selectedDestination.state);

  const bounds = L.latLngBounds(pickupCoords, destinationCoords);
  map.fitBounds(bounds, { padding: [40, 40] });
  pickupMarker.openPopup();

  // Draw driving route using OSRM
  const routeInfo = document.getElementById("route-info");
  const distanceVal = document.getElementById("distance-value");
  const durationVal = document.getElementById("duration-value");

  try {
    const result = await drawRoute(selectedPickup, selectedDestination);
    if (routeInfo && distanceVal && durationVal) {
      distanceVal.textContent = `${result.distanceKm} km`;
      durationVal.textContent = `${result.durationMinutes} mins (~${(result.durationMinutes / 60).toFixed(1)} hrs)`;
      routeInfo.style.display = "flex";
    }
  } catch (error) {
    console.warn("OSRM calculation unavailable, using straight-line bounds:", error);
    // Draw straight line fallback if OSRM is rate limited
    if (routeLayer) map.removeLayer(routeLayer);
    routeLayer = L.polyline([pickupCoords, destinationCoords], {
      color: "#2563eb",
      dashArray: "6, 8",
      weight: 4
    }).addTo(map);

    // Approximate haversine distance
    const R = 6371;
    const dLat = (destinationCoords[0] - pickupCoords[0]) * Math.PI / 180;
    const dLon = (destinationCoords[1] - pickupCoords[1]) * Math.PI / 180;
    const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(pickupCoords[0] * Math.PI / 180) * Math.cos(destinationCoords[0] * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const approxKm = (R * c * 1.2).toFixed(1);

    if (routeInfo && distanceVal && durationVal) {
      distanceVal.textContent = `~${approxKm} km (est.)`;
      durationVal.textContent = `~${Math.round(approxKm / 60 * 60)} mins`;
      routeInfo.style.display = "flex";
    }
  }
});

// Helper for quick testing chips
window.setQuickTrip = function (pickupCity, destCity) {
  const pickupObj = locations.find((l) => l.city.toLowerCase() === pickupCity.toLowerCase());
  const destObj = locations.find((l) => l.city.toLowerCase() === destCity.toLowerCase());

  if (pickupObj) {
    selectedPickup = pickupObj;
    document.getElementById("pickup").value = `${pickupObj.city}, ${pickupObj.state}, India`;
  }
  if (destObj) {
    selectedDestination = destObj;
    document.getElementById("destination").value = `${destObj.city}, ${destObj.state}, India`;
  }

  document.getElementById("show-route").click();
};

// GPS button reverse geocoding to City and State name (No raw lat/long)
const gpsBtn = document.getElementById("gps-btn");
if (gpsBtn) {
  gpsBtn.addEventListener("click", () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    gpsBtn.textContent = "Detecting City...";
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        let cityName = "";
        let stateName = "";

        try {
          const r1 = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
          if (r1.ok) {
            const d1 = await r1.json();
            if (d1?.city || d1?.locality) cityName = (d1.city || d1.locality || "").trim();
            if (d1?.principalSubdivision) stateName = d1.principalSubdivision.trim();
          }
        } catch (e) {
          console.warn("BigDataCloud error:", e);
        }

        if (!cityName || !stateName) {
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=14&addressdetails=1`, {
              headers: { "Accept-Language": "en", "User-Agent": "WanderPayTripPlanner/1.0" }
            });
            if (res.ok) {
              const data = await res.json();
              if (data?.address) {
                const rawCity = data.address.city || data.address.town || data.address.suburb || data.address.village;
                if (rawCity && !cityName) cityName = rawCity.replace(/\s+(mandal|district|taluk|tehsil)$/i, "").trim();
                if (data.address.state && !stateName) stateName = data.address.state.trim();
              }
            }
          } catch (e) {
            console.warn("Reverse geocode error:", e);
          }
        }

        // Fallback: nearest city from locations
        if (!cityName || !stateName) {
          if (locations && locations.length > 0) {
            let closest = locations[0];
            let minDist = Infinity;
            for (const loc of locations) {
              const d = Math.hypot(loc.latitude - latitude, loc.longitude - longitude);
              if (d < minDist) {
                minDist = d;
                closest = loc;
              }
            }
            if (!cityName) cityName = closest.city;
            if (!stateName) stateName = closest.state;
          } else {
            cityName = "Hyderabad";
            stateName = "Telangana";
          }
        }

        selectedPickup = {
          city: cityName,
          state: stateName,
          country: "India",
          latitude,
          longitude
        };

        document.getElementById("pickup").value = `${cityName}, ${stateName}, India`;
        gpsBtn.textContent = `📍 ${cityName}, ${stateName}`;
      },
      (err) => {
        console.warn(err);
        gpsBtn.textContent = "📍 Detect City via GPS";
        alert("GPS location permission denied or unavailable.");
      },
      { timeout: 8000 }
    );
  });
}

