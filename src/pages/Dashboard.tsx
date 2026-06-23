import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAppSelector } from "../store/store";
import incidentService from "../services/incidentService";
import groupService from "../services/groupService";
import MapContainer from "../components/map/MapContainer";
import IncidentForm from "../components/incidents/IncidentForm";
import IncidentCard from "../components/incidents/IncidentCard";
import type { Incident } from "../components/incidents/IncidentCard";

interface Group {
  _id: string;
  name: string;
}

const Dashboard = () => {
  const location = useLocation();
  const { token, user } = useAppSelector((state) => state.auth);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mobile/Tablet responsive tabs
  const [activeTab, setActiveTab] = useState<"map" | "panel">("map");

  // Map state
  const [selectedCoordinates, setSelectedCoordinates] = useState<[number, number] | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  // Listen to redirect state from View on Map actions
  useEffect(() => {
    if (location.state && (location.state as any).centerCoordinates) {
      const stateData = location.state as any;
      const coords = stateData.centerCoordinates as [number, number];
      const incidentId = stateData.selectedIncidentId as string;

      // Set map focus coords
      setSelectedCoordinates(coords);
      setActiveTab("map"); // Show the map view on mobile first to see the location
      
      // If incident ID is provided, try to find and select it
      if (incidentId && incidents.length > 0) {
        const found = incidents.find(i => i._id === incidentId);
        if (found) {
          setSelectedIncident(found);
          setSelectedCoordinates(null); // Clear manual pin to focus on actual incident marker
          setActiveTab("map"); // Force mobile tab to stay on map view to show popup bubble
        }
      }
    }
  }, [location.state, incidents]);

  const fetchData = async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError(null);
      const [incidentsData, groupsData] = await Promise.all([
        incidentService.getIncidents(token),
        groupService.getUserGroups(token),
      ]);
      setIncidents(incidentsData);
      setGroups(groupsData);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const handleMapClick = (lng: number, lat: number) => {
    setSelectedIncident(null);
    setSelectedCoordinates([lng, lat]);
    setActiveTab("panel"); // Auto-focus panel on mobile/tablet to let user fill report
  };

  const handleMarkerClick = (incident: Incident) => {
    setSelectedCoordinates(null);
    setSelectedIncident(incident);
    setActiveTab("panel"); // Auto-focus panel on mobile/tablet to view details
  };

  const handleCreateIncidentSubmit = async (formData: {
    title: string;
    description: string;
    type: string;
    visibility: "public" | "private" | "group";
    sharedWithGroups?: string[];
    coordinates: [number, number];
  }) => {
    if (!token) return;
    try {
      const newIncident = await incidentService.createIncident(formData, token);
      setIncidents((prev) => [newIncident, ...prev]);
      setSelectedCoordinates(null);
      fetchData();
      setActiveTab("map"); // Switch back to map to see new marker
    } catch (err: any) {
      alert(err.response?.data?.message || "Error creating incident report.");
    }
  };

  const handleUpvote = async (incidentId: string) => {
    if (!token) return;
    try {
      // Optimistic update
      setIncidents((prev) =>
        prev.map((inc) => {
          if (inc._id === incidentId) {
            const hasUpvoted = inc.upvotes.includes(user._id);
            return {
              ...inc,
              upvotes: hasUpvoted
                ? inc.upvotes.filter((id) => id !== user._id)
                : [...inc.upvotes, user._id],
            };
          }
          return inc;
        })
      );

      if (selectedIncident && selectedIncident._id === incidentId) {
        const hasUpvoted = selectedIncident.upvotes.includes(user._id);
        setSelectedIncident({
          ...selectedIncident,
          upvotes: hasUpvoted
            ? selectedIncident.upvotes.filter((id) => id !== user._id)
            : [...selectedIncident.upvotes, user._id],
        });
      }

      // API Call
      const updatedIncident = await incidentService.toggleUpvote(incidentId, token);

      // Synced state
      setIncidents((prev) => prev.map((inc) => (inc._id === incidentId ? updatedIncident : inc)));
      if (selectedIncident && selectedIncident._id === incidentId) {
        setSelectedIncident(updatedIncident);
      }
    } catch (err) {
      console.error("Upvote failed", err);
      fetchData();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col h-[calc(100vh-100px)] space-y-6">
      {/* Header bar */}
      <div className="flex justify-between items-center pb-4 border-b border-darkBorder/30">
        <div>
          <h1 className="text-3xl font-extrabold text-darkText tracking-tight text-left">
            Interactive Map
          </h1>
          <p className="text-darkTextSecondary text-sm text-left">
            Real-time visual reports of local incidents and hazards.
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className={`p-2.5 bg-darkCard border border-darkBorder rounded-xl hover:bg-brandPrimary/10 hover:text-brandPrimary text-darkTextSecondary transition-all cursor-pointer ${loading ? "opacity-50" : ""}`}
        >
          <svg className={`h-5 w-5 ${loading ? "animate-spin text-brandPrimary" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.283 8H18" />
          </svg>
        </button>
      </div>

      {error && (
        <div className="bg-rose-500/10 border-2 border-rose-500/35 text-rose-600 dark:text-rose-400 p-4 rounded-2xl text-sm font-medium text-left flex items-start gap-3 animate-fadeIn">
          <svg className="h-5 w-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Mobile Tab Toggles (Visible only on < lg screens) */}
      <div className="flex lg:hidden border-2 border-darkBorder p-1 rounded-xl bg-darkCard">
        <button
          onClick={() => setActiveTab("map")}
          className={`flex-1 py-2 text-center text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeTab === "map"
              ? "bg-brandPrimary text-white dark:text-slate-950 shadow-md"
              : "text-darkTextSecondary hover:text-darkText"
          }`}
        >
          Map View
        </button>
        <button
          onClick={() => setActiveTab("panel")}
          className={`flex-1 py-2 text-center text-xs font-bold rounded-lg transition-all cursor-pointer relative ${
            activeTab === "panel"
              ? "bg-brandPrimary text-white dark:text-slate-950 shadow-md"
              : "text-darkTextSecondary hover:text-darkText"
          }`}
        >
          Details / Report
          {(selectedCoordinates || selectedIncident) && (
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
          )}
        </button>
      </div>

      {/* Main workspace layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
        {/* Left Side: MapContainer */}
        <div className={`lg:col-span-2 h-full min-h-[500px] ${activeTab === "map" ? "block" : "hidden lg:block"}`}>
          <MapContainer
            incidents={incidents}
            onMapClick={handleMapClick}
            onMarkerClick={handleMarkerClick}
            selectedCoordinates={selectedCoordinates}
            selectedIncident={selectedIncident}
          />
        </div>

        {/* Right Side: Floating controls panel */}
        <div className={`h-full overflow-y-auto pr-1 ${activeTab === "panel" ? "block" : "hidden lg:block"}`}>
          {selectedCoordinates ? (
            <IncidentForm
              coordinates={selectedCoordinates}
              groups={groups}
              onSubmit={handleCreateIncidentSubmit}
              onCancel={() => setSelectedCoordinates(null)}
              onCoordinatesChange={setSelectedCoordinates}
            />
          ) : selectedIncident ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-darkCard border-2 border-darkBorder px-4 py-3 rounded-xl">
                <span className="text-xs font-bold text-darkTextSecondary uppercase tracking-wider">Report Details</span>
                <button
                  onClick={() => setSelectedIncident(null)}
                  className="text-darkTextSecondary hover:text-darkText transition-colors cursor-pointer"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <IncidentCard
                incident={selectedIncident}
                onUpvote={handleUpvote}
              />
            </div>
          ) : (
            <div className="bg-darkCard border-2 border-darkBorder rounded-2xl p-6 h-full flex flex-col justify-center text-center space-y-6">
              <div className="bg-brandPrimary/10 h-16 w-16 rounded-2xl flex items-center justify-center text-brandPrimary mx-auto border border-brandPrimary/20">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <div className="space-y-2 max-w-xs mx-auto">
                <h3 className="text-lg font-bold text-darkText">No Incident Selected</h3>
                <p className="text-darkTextSecondary text-sm leading-relaxed">
                  Click on an existing map marker to view detailed descriptions, status updates, and upvote reports.
                </p>
              </div>
              <div className="border-t border-darkBorder/40 pt-6 space-y-4">
                <p className="text-xs text-darkTextSecondary">
                  Total Active Incidents: <span className="font-bold text-darkText">{incidents.length}</span>
                </p>
                <button
                  onClick={() => {
                    setSelectedIncident(null);
                    setSelectedCoordinates([79.8612, 6.9271]); // Default Colombo coordinates
                    setActiveTab("panel");
                  }}
                  className="w-full py-3 rounded-xl text-xs font-bold bg-brandPrimary hover:bg-teal-800 dark:hover:bg-teal-400 text-white dark:text-slate-950 transition-all shadow-lg cursor-pointer"
                >
                  Report by entering Coordinates
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
