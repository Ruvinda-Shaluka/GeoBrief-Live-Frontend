import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../store/store";
import incidentService from "../services/incidentService";
import HeroSection from "../components/home/HeroSection";
import CategoryFilter from "../components/home/CategoryFilter";
import IncidentCard from "../components/incidents/IncidentCard";
import type { Incident } from "../components/incidents/IncidentCard";
import GeoBriefSummarizer from "../components/home/GeoBriefSummarizer";

const Home = () => {
  const navigate = useNavigate();
  const { token } = useAppSelector((state) => state.auth);
  
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchTerm]);

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

  // Filter incidents locally by type and search query
  const filteredIncidents = incidents.filter((incident) => {
    const matchesCategory = selectedCategory === "all" || incident.type.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = incident.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          incident.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const totalPages = Math.ceil(filteredIncidents.length / ITEMS_PER_PAGE);
  const paginatedIncidents = filteredIncidents.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Hero Section Banner */}
      <HeroSection />

      {/* Search Bar & Category Filter */}
      <div className="border-t border-darkBorder/30 pt-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-darkText tracking-tight text-left">
              Recent Incidents
            </h2>
            <p className="text-xs text-darkTextSecondary text-left">
              Filter by categories or search for specific issues below.
            </p>
          </div>
          
          <div className="relative w-full md:w-80">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-darkTextSecondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search incidents..."
              className="w-full bg-darkCard border border-darkBorder rounded-xl pl-9 pr-4 py-2.5 text-xs text-darkText focus:outline-none focus:border-brandPrimary transition-colors focus:ring-1 focus:ring-brandPrimary"
            />
          </div>
        </div>
        
        <CategoryFilter
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      </div>

      <hr className="border-darkBorder/30" />

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
        <div className="text-center py-16 bg-rose-500/5 rounded-2xl border border-rose-500/20 p-8 max-w-xl mx-auto space-y-6">
          <div className="bg-rose-500/10 h-16 w-16 rounded-2xl flex items-center justify-center text-rose-500 mx-auto border border-rose-500/25">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-darkText">Something went wrong</h3>
            <p className="text-darkTextSecondary text-sm max-w-sm mx-auto">{error}</p>
          </div>
          <button
            onClick={fetchPublicIncidents}
            className="px-6 py-3 bg-brandPrimary hover:bg-teal-800 dark:hover:bg-teal-400 text-white dark:text-slate-950 text-sm font-bold rounded-xl transition-all shadow-md cursor-pointer select-none"
          >
            Try Again
          </button>
        </div>
      ) : filteredIncidents.length === 0 ? (
        <div className="text-center py-20 bg-darkCard border border-darkBorder rounded-2xl p-8 max-w-lg mx-auto space-y-6">
          <div className="bg-brandPrimary/10 h-16 w-16 rounded-2xl flex items-center justify-center text-brandPrimary mx-auto border border-brandPrimary/20">
            <svg className="mx-auto h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-darkText">No incidents found</h3>
            <p className="text-darkTextSecondary text-sm max-w-md mx-auto">
              There are no public incidents reported under "{selectedCategory}" yet. Be the first to report an issue!
            </p>
          </div>
          <button
            onClick={() => navigate(token ? "/dashboard" : "/login")}
            className="px-8 py-3 bg-brandPrimary hover:bg-teal-800 dark:hover:bg-teal-400 text-white dark:text-slate-950 rounded-xl text-sm font-bold transition-all shadow-lg hover:scale-[1.01] active:scale-[0.99] cursor-pointer select-none"
          >
            Report an Incident
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* GeoBrief Area Summarizer */}
          <GeoBriefSummarizer incidents={filteredIncidents} />

          {/* Incident Feed Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedIncidents.map((incident) => (
              <IncidentCard
                key={incident._id}
                incident={incident}
                onUpvote={handleUpvote}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-4 pt-4">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-darkCard border border-darkBorder hover:bg-slate-200 dark:hover:bg-slate-800 text-darkTextSecondary hover:text-darkText rounded-xl text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed select-none cursor-pointer"
              >
                Previous
              </button>
              <span className="text-xs text-darkTextSecondary font-bold">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-darkCard border border-darkBorder hover:bg-slate-200 dark:hover:bg-slate-800 text-darkTextSecondary hover:text-darkText rounded-xl text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed select-none cursor-pointer"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Home;
