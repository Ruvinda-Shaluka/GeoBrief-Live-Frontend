import { useState } from "react";
import { useAppSelector } from "../../store/store";
import aiService from "../../services/aiService";
import type { Incident } from "../incidents/IncidentCard";

interface GeoBriefSummarizerProps {
  incidents: Incident[];
}

const GeoBriefSummarizer = ({ incidents }: GeoBriefSummarizerProps) => {
  const { token } = useAppSelector((state) => state.auth);
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateBrief = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setSummary(null);

      // Map current incidents to string representations
      const incidentStrings = incidents.map(
        (inc) => `Title: ${inc.title}, Category: ${inc.type}, Description: ${inc.description}`
      );

      const briefText = await aiService.getBriefSummary(incidentStrings, token);
      setSummary(briefText);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to generate AI area briefing.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full mb-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-darkCard/30 border border-darkBorder rounded-2xl gap-4">
        <div className="text-left">
          <h3 className="text-sm font-bold text-darkText flex items-center gap-1.5">
            <svg className="h-4 w-4 text-brandPrimary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Geo-Brief AI Summarizer
          </h3>
          <p className="text-xs text-darkTextSecondary mt-0.5">
            Generate an AI-powered local alert overview of the currently filtered {incidents.length} incident(s).
          </p>
        </div>

        <button
          type="button"
          onClick={handleGenerateBrief}
          disabled={isLoading}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold bg-brandPrimary text-white hover:bg-purple-500 transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer disabled:opacity-50 select-none animate-pulse hover:animate-none"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.813 15.904L9 21l-1.813-5.096L2 15l5.187-1.096L9 9l.813 4.904L15 15l-5.187.904zM19.071 4.929l-.707 2.122-2.122.707 2.122.707.707 2.122.707-2.122 2.122-.707-2.122-.707-.707-2.122z" />
          </svg>
          {isLoading ? "Summarizing..." : "Generate Area Briefing"}
        </button>
      </div>

      {isLoading && (
        <div className="bg-darkCard/50 border border-darkBorder rounded-2xl p-5 mt-4 space-y-2.5 animate-pulse text-left">
          <div className="h-4 bg-darkBorder rounded-md w-3/4" />
          <div className="h-4 bg-darkBorder rounded-md w-5/6" />
          <div className="h-4 bg-darkBorder rounded-md w-1/2" />
        </div>
      )}

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/25 text-rose-600 dark:text-rose-400 text-xs py-3 px-4 rounded-2xl mt-4 font-semibold text-left">
          {error}
        </div>
      )}

      {summary && (
        <div className="bg-darkCard/75 backdrop-blur-md border border-brandPrimary/35 rounded-2xl p-5 mt-4 shadow-xl text-left animate-fadeIn">
          <h4 className="text-xs font-extrabold text-brandPrimary uppercase tracking-wider mb-2 flex items-center gap-1.5 select-none">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            Broadcast Briefing
          </h4>
          <p className="text-sm text-darkText leading-relaxed font-medium">
            {summary}
          </p>
        </div>
      )}
    </div>
  );
};

export default GeoBriefSummarizer;
