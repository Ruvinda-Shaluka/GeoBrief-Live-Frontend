import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { Incident } from "../incidents/IncidentCard";

interface MapContainerProps {
  incidents: Incident[];
  onMapClick: (lng: number, lat: number) => void;
  onMarkerClick: (incident: Incident) => void;
  selectedCoordinates: [number, number] | null;
}

const MapContainer = ({
  incidents,
  onMapClick,
  onMarkerClick,
  selectedCoordinates,
}: MapContainerProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const clickMarkerRef = useRef<maplibregl.Marker | null>(null);

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
      map.easeTo({ center: selectedCoordinates, zoom: Math.max(map.getZoom(), 13) });
    }
  }, [selectedCoordinates]);

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-darkBorder/60 shadow-2xl">
      {/* Map Container Element */}
      <div ref={mapContainerRef} className="w-full h-full" style={{ minHeight: "550px" }} />

      {/* Overlay Help Banner */}
      <div className="absolute bottom-4 left-4 bg-darkBg/90 backdrop-blur-md border border-darkBorder/60 px-4 py-2 rounded-xl text-xs text-slate-300 pointer-events-none shadow-lg max-w-xs leading-relaxed">
        <span className="font-semibold text-brandPrimary">Protip:</span> Click anywhere on the map to pin and report a new incident.
      </div>
    </div>
  );
};

export default MapContainer;
