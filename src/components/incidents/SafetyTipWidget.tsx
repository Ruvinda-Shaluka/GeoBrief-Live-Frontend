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
    <div className="w-full mt-3 text-left">
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
        <div className="bg-yellow-500/10 dark:bg-yellow-900/20 border border-yellow-500/35 text-yellow-950 dark:text-yellow-200 text-xs p-3.5 rounded-xl mt-1 shadow-md leading-relaxed font-semibold animate-fadeIn">
          {tip}
        </div>
      )}
    </div>
  );
};

export default SafetyTipWidget;
