import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../store/store";
import incidentService from "../services/incidentService";
import IncidentCard from "../components/incidents/IncidentCard";
import type { Incident } from "../components/incidents/IncidentCard";

const PrivateIncidents = () => {
  const navigate = useNavigate();
  const { token } = useAppSelector((state) => state.auth);
  
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchPrivateIncidents = async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError(null);
      const data = await incidentService.getIncidents(token);
      
      // Filter incidents where visibility is private
      const privateOnly = data.filter((inc: Incident) => inc.visibility === "private");
      setIncidents(privateOnly);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load private incidents.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrivateIncidents();
  }, [token]);

  const handleUpvote = async (incidentId: string) => {
    if (!token) return;
    try {
      const updatedIncident = await incidentService.toggleUpvote(incidentId, token);
      setIncidents((prev) =>
        prev.map((inc) => (inc._id === incidentId ? updatedIncident : inc))
      );
    } catch (err) {
      console.error("Upvote failed", err);
    }
  };

  // Filter incidents locally by search query
  const filteredIncidents = incidents.filter((incident) => {
    return (
      incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.type.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-left">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-darkText tracking-tight">
            My Private Incidents
          </h1>
          <p className="text-darkTextSecondary text-sm">
            Incidents reported privately. Only you can view or interact with these reports.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-darkTextSecondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search private entries..."
              className="w-full bg-darkCard border border-darkBorder rounded-xl pl-9 pr-4 py-2.5 text-xs text-darkText focus:outline-none focus:border-brandPrimary transition-colors"
            />
          </div>

          <button
            onClick={() => navigate("/dashboard")}
            className="w-full sm:w-auto px-5 py-2.5 bg-brandPrimary hover:bg-teal-800 dark:hover:bg-teal-400 text-white dark:text-slate-950 rounded-xl text-xs font-bold transition-all shadow-lg hover:scale-[1.01] active:scale-[0.99] cursor-pointer select-none"
          >
            Report New Incident
          </button>
        </div>
      </div>
      <hr className="border-darkBorder/30 my-6" />

      {error && (
        <div className="bg-rose-500/10 border-2 border-rose-500/35 text-rose-600 dark:text-rose-400 p-4 rounded-2xl text-sm font-medium mb-6 text-left flex items-start gap-3 animate-fadeIn">
          <svg className="h-5 w-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-darkCard/25 border border-darkBorder/20 rounded-2xl p-6 h-48 animate-pulse space-y-4">
              <div className="flex justify-between items-center">
                <div className="h-6 w-24 bg-slate-850 rounded-lg" />
                <div className="h-4 w-16 bg-slate-850 rounded-lg" />
              </div>
              <div className="h-6 w-3/4 bg-slate-850 rounded-lg" />
              <div className="space-y-2">
                <div className="h-4 w-full bg-slate-850 rounded-lg" />
                <div className="h-4 w-5/6 bg-slate-850 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : incidents.length === 0 ? (
        <div className="text-center py-20 bg-darkCard border-2 border-darkBorder rounded-2xl p-8 max-w-lg mx-auto mt-6">
          <svg className="mx-auto h-12 w-12 text-darkTextSecondary mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <h3 className="text-lg font-bold text-darkText mb-2">No private incidents</h3>
          <p className="text-darkTextSecondary text-sm mb-6">
            You haven't reported any private incidents. Use the Map Dashboard to report a hazard and set its visibility to "private".
          </p>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-8 py-3 bg-brandPrimary hover:bg-teal-800 dark:hover:bg-teal-400 text-white dark:text-slate-950 rounded-xl text-sm font-bold transition-all shadow-lg hover:scale-[1.01] active:scale-[0.99] cursor-pointer select-none"
          >
            Go to Map Dashboard
          </button>
        </div>
      ) : filteredIncidents.length === 0 ? (
        <div className="text-center py-16 bg-darkCard border-2 border-darkBorder rounded-2xl p-8 max-w-md mx-auto mt-6">
          <p className="text-darkTextSecondary text-sm">
            No private entries found matching "{searchTerm}".
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIncidents.map((incident) => (
            <IncidentCard
              key={incident._id}
              incident={incident}
              onUpvote={handleUpvote}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PrivateIncidents;
