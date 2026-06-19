import { useState } from "react";
import { useAppSelector } from "../../store/store";
import aiService from "../../services/aiService";

interface SafetyTipWidgetProps {
  title: string;
  category: string;
}

const SafetyTipWidget = ({ title, category }: SafetyTipWidgetProps) => {
  const { token } = useAppSelector((state) => state.auth);
  const [tip, setTip] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSafetyTip = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const safetyTip = await aiService.getSafetyTip({ title, category }, token);
      setTip(safetyTip);
    } catch (err: any) {
      setError(err.response?.data?.message || "Could not retrieve safety tip.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full mt-1 mb-4 text-left">
      {!tip && !isLoading && (
        <button
          type="button"
          onClick={fetchSafetyTip}
          className="text-[10px] text-brandPrimary border border-brandPrimary/50 rounded-full px-3 py-1 hover:bg-brandPrimary/10 transition-all font-bold uppercase tracking-wider cursor-pointer select-none"
        >
          Get AI Safety Tip
        </button>
      )}

      {isLoading && (
        <div className="animate-pulse space-y-1 bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-3 mt-1 text-left">
          <div className="h-3 bg-yellow-500/25 rounded-md w-full" />
          <div className="h-3 bg-yellow-500/25 rounded-md w-5/6" />
        </div>
      )}

      {error && !tip && (
        <div className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold bg-rose-500/10 border border-rose-500/20 rounded-xl px-3 py-1.5 mt-1 flex items-center justify-between">
          <span>{error}</span>
          <button
            type="button"
            onClick={fetchSafetyTip}
            className="underline hover:text-rose-700 dark:hover:text-rose-300 font-bold ml-2"
          >
            Retry
          </button>
        </div>
      )}

      {tip && (
        <div className="relative bg-yellow-500/10 dark:bg-yellow-900/20 border border-yellow-500/35 text-yellow-950 dark:text-yellow-200 text-xs p-3.5 pr-8 rounded-xl mt-1 shadow-md leading-relaxed font-semibold animate-fadeIn">
          {tip}
          <button
            type="button"
            onClick={() => setTip(null)}
            className="absolute top-2.5 right-2.5 text-yellow-800 dark:text-yellow-400 hover:text-yellow-950 dark:hover:text-yellow-100 transition-colors p-0.5 cursor-pointer"
            title="Dismiss safety notice"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default SafetyTipWidget;
