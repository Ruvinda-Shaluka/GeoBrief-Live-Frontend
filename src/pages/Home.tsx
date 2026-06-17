import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../store/store";
import incidentService from "../services/incidentService";
import HeroSection from "../components/home/HeroSection";
import CategoryFilter from "../components/home/CategoryFilter";
import IncidentCard from "../components/incidents/IncidentCard";
import type { Incident } from "../components/incidents/IncidentCard";

const Home = () => {
  const navigate = useNavigate();
  const { token } = useAppSelector((state) => state.auth);
  
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const fetchPublicIncidents = async () => {
    try {
      setLoading(true);
      const data = await incidentService.getPublicIncidents();
      setIncidents(data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load public incidents.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublicIncidents();
  }, []);

  const handleUpvote = async (incidentId: string) => {
    if (!token) {
      // Redirect to login if user isn't authenticated
      navigate("/login");
      return;
    }

    try {
      // Opt-in update: locally toggle upvote before api response for instant reaction
      setIncidents((prevIncidents) =>
        prevIncidents.map((inc) => {
          if (inc._id === incidentId) {
            // For now, let's toggle in a generic way and let API response overwrite if needed
            return {
              ...inc,
              upvotes: inc.upvotes.includes("user_temp") 
                ? inc.upvotes.filter(id => id !== "user_temp") 
                : [...inc.upvotes, "user_temp"]
            };
          }
          return inc;
        })
      );

      // Call API
      const updatedIncident = await incidentService.toggleUpvote(incidentId, token);
      
      // Update with exact state from backend
      setIncidents((prevIncidents) =>
        prevIncidents.map((inc) => (inc._id === incidentId ? updatedIncident : inc))
      );
    } catch (err) {
      console.error("Upvote toggle failed", err);
      // Revert/Refetch on failure
      fetchPublicIncidents();
    }
  };

  // Filter incidents locally by type
  const filteredIncidents = incidents.filter((incident) => {
    if (selectedCategory === "all") return true;
    return incident.type.toLowerCase() === selectedCategory.toLowerCase();
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section Banner */}
      <HeroSection />

      {/* Category Filter Pills */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <h2 className="text-2xl font-bold text-white tracking-tight">
          Recent Incidents
        </h2>
        <CategoryFilter
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      </div>

      {/* Loading & Error States */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-darkCard/25 border border-darkBorder/20 rounded-2xl p-6 h-48 animate-pulse space-y-4">
              <div className="flex justify-between items-center">
                <div className="h-6 w-24 bg-slate-800 rounded-lg" />
                <div className="h-4 w-16 bg-slate-800 rounded-lg" />
              </div>
              <div className="h-6 w-3/4 bg-slate-800 rounded-lg" />
              <div className="space-y-2">
                <div className="h-4 w-full bg-slate-800 rounded-lg" />
                <div className="h-4 w-5/6 bg-slate-800 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-16 bg-darkCard/20 rounded-2xl border border-red-500/20 p-8">
          <p className="text-red-400 font-medium mb-4">{error}</p>
          <button
            onClick={fetchPublicIncidents}
            className="px-6 py-2.5 bg-brandPrimary hover:bg-purple-500 text-white rounded-lg text-sm font-semibold transition-colors cursor-pointer"
          >
            Try Again
          </button>
        </div>
      ) : filteredIncidents.length === 0 ? (
        <div className="text-center py-20 bg-darkCard/20 rounded-2xl border border-darkBorder/40 p-8 max-w-lg mx-auto">
          <svg className="mx-auto h-12 w-12 text-slate-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-bold text-white mb-2">No incidents found</h3>
          <p className="text-slate-400 text-sm mb-6">
            There are no public incidents reported under "{selectedCategory}" yet. Be the first to report an issue!
          </p>
          <button
            onClick={() => navigate(token ? "/dashboard" : "/login")}
            className="px-6 py-2.5 bg-brandPrimary hover:bg-purple-500 text-white rounded-lg text-sm font-semibold transition-colors shadow-lg cursor-pointer"
          >
            Report an Incident
          </button>
        </div>
      ) : (
        /* Incident Feed Grid */
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

export default Home;
