import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { Incident } from "../incidents/IncidentCard";

interface MapContainerProps {
  incidents: Incident[];
  onMapClick: (lng: number, lat: number) => void;
  onMarkerClick: (incident: Incident) => void;
  selectedCoordinates: [number, number] | null;
  selectedIncident: Incident | null;
}

const MapContainer = ({
  incidents,
  onMapClick,
  onMarkerClick,
  selectedCoordinates,
  selectedIncident,
}: MapContainerProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const clickMarkerRef = useRef<maplibregl.Marker | null>(null);
  const activePopupRef = useRef<maplibregl.Popup | null>(null);

  // Geocoding Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setSearchLoading(true);
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(
          searchQuery.trim()
        )}`
      );
      const data = await res.json();
      setSearchResults(data);
    } catch (err) {
      console.error("Geocoding failed", err);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleResultSelect = (result: any) => {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    
    if (mapRef.current && !isNaN(lat) && !isNaN(lon)) {
      mapRef.current.flyTo({
        center: [lon, lat],
        zoom: 14,
        essential: true
      });
      onMapClick(lon, lat);
    }
    setSearchResults([]);
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Use CartoDB Dark Matter style
    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
      center: [79.8612, 6.9271], // Colombo, Sri Lanka default center
      zoom: 12,
      maxZoom: 18,
      minZoom: 2,
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");

    map.on("click", (e) => {
      // Prevent click event when clicking elements
      if ((e.originalEvent.target as HTMLElement).closest(".custom-marker")) return;
      onMapClick(e.lngLat.lng, e.lngLat.lat);
    });

    mapRef.current = map;

    return () => {
      map.remove();
    };
  }, []);

  // Update Incident Markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Render new markers
    incidents.forEach((incident) => {
      if (!incident.location || !incident.location.coordinates) return;
      const [lng, lat] = incident.location.coordinates;

      // Color coding based on incident type
      let markerColor = "bg-purple-500 ring-purple-500/30";
      if (incident.type === "road") markerColor = "bg-amber-500 ring-amber-500/30";
      else if (incident.type === "power") markerColor = "bg-yellow-400 ring-yellow-400/30";
      else if (incident.type === "safety") markerColor = "bg-red-500 ring-red-500/30";
      else if (incident.type === "food") markerColor = "bg-emerald-500 ring-emerald-500/30";

      // Create Custom Marker DOM Element
      const el = document.createElement("div");
      el.className = "custom-marker cursor-pointer";
      el.innerHTML = `
        <div class="relative flex items-center justify-center h-8 w-8">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-40 ring-4 ${markerColor}"></span>
          <span class="relative inline-flex rounded-full h-4.5 w-4.5 border-2 border-white shadow-lg ${markerColor.split(" ")[0]}"></span>
        </div>
      `;

      el.addEventListener("click", (e) => {
        e.stopPropagation();
        onMarkerClick(incident);
      });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([lng, lat])
        .addTo(map);

      markersRef.current.push(marker);
    });
  }, [incidents]);

  // Handle Temp Pin on Map Click for Reporting
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (clickMarkerRef.current) {
      clickMarkerRef.current.remove();
      clickMarkerRef.current = null;
    }

    if (selectedCoordinates) {
      const el = document.createElement("div");
      el.className = "custom-click-marker cursor-pointer";
      el.innerHTML = `
        <div class="relative flex items-center justify-center h-10 w-10">
          <span class="absolute inline-flex h-full w-full rounded-full bg-rose-500/20 border border-rose-500 animate-pulse"></span>
          <svg class="h-6 w-6 text-rose-500 drop-shadow-md relative z-10" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
          </svg>
        </div>
      `;

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat(selectedCoordinates)
        .addTo(map);

      clickMarkerRef.current = marker;

      // Only center/ease camera if user is NOT typing coordinates in the text boxes
      const activeEl = document.activeElement;
      const isTypingCoords = activeEl && (activeEl.id === "lat" || activeEl.id === "lng");
      if (!isTypingCoords) {
        map.easeTo({ center: selectedCoordinates, zoom: Math.max(map.getZoom(), 13) });
      }
    }
  }, [selectedCoordinates]);

  // Handle Selected Incident Popups
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (activePopupRef.current) {
      activePopupRef.current.remove();
      activePopupRef.current = null;
    }

    if (selectedIncident && selectedIncident.location && selectedIncident.location.coordinates) {
      const [lng, lat] = selectedIncident.location.coordinates;

      // Popup Content layout inside Carto/MERN theme
      const htmlContent = `
        <div class="p-1.5 text-left">
          <h4 class="font-bold text-xs leading-snug">${selectedIncident.title}</h4>
          <p class="text-[10px] mt-1 line-clamp-2 leading-relaxed opacity-90">${selectedIncident.description}</p>
          <div class="mt-2 flex items-center justify-between">
            <span class="inline-block text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded bg-brandPrimary/25 text-brandPrimary">${selectedIncident.type}</span>
            <span class="text-[8px] opacity-70 font-semibold">${selectedIncident.visibility}</span>
          </div>
        </div>
      `;

      const popup = new maplibregl.Popup({
        offset: 15,
        closeButton: true,
        closeOnClick: false,
      })
        .setLngLat([lng, lat])
        .setHTML(htmlContent)
        .addTo(map);

      activePopupRef.current = popup;
      map.easeTo({ center: [lng, lat], zoom: Math.max(map.getZoom(), 14) });
    }
  }, [selectedIncident]);

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border-2 border-darkBorder shadow-2xl">
      {/* Map Container Element */}
      <div ref={mapContainerRef} className="w-full h-full" style={{ minHeight: "550px" }} />

      {/* Location Search Bar Overlay */}
      <div className="absolute top-4 left-4 z-10 w-72 sm:w-80">
        <form onSubmit={handleSearchSubmit} className="relative flex items-center shadow-lg">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {searchLoading ? (
              <svg className="h-4 w-4 animate-spin text-brandPrimary" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <svg className="h-4 w-4 text-darkTextSecondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            )}
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search location (e.g. Colombo, London)..."
            className="w-full bg-darkCard/95 backdrop-blur-md border border-darkBorder rounded-xl pl-9 pr-8 py-2.5 text-xs text-darkText focus:outline-none focus:border-brandPrimary transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSearchResults([]);
              }}
              className="absolute right-2 text-darkTextSecondary hover:text-darkText cursor-pointer transition-colors p-1"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </form>

        {/* Search Results Dropdown */}
        {searchResults.length > 0 && (
          <div className="absolute top-11 left-0 w-full bg-darkCard/95 backdrop-blur-md border border-darkBorder rounded-xl shadow-xl overflow-hidden z-20 max-h-60 overflow-y-auto">
            {searchResults.map((result, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleResultSelect(result)}
                className="w-full text-left px-4 py-2.5 hover:bg-brandPrimary/10 border-b border-darkBorder/40 last:border-0 text-xs text-darkText font-semibold transition-colors truncate block"
              >
                {result.display_name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Overlay Help Banner */}
      <div className="absolute bottom-4 left-4 bg-darkCard border border-darkBorder px-4 py-2 rounded-xl text-xs text-darkTextSecondary pointer-events-none shadow-lg max-w-xs leading-relaxed">
        <span className="font-bold text-brandPrimary">Protip:</span> Click anywhere on the map to pin and report a new incident.
      </div>
    </div>
  );
};

export default MapContainer;
