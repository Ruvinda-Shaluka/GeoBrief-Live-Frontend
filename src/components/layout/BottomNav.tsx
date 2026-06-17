import { Link, useLocation } from "react-router-dom";
import { useAppSelector } from "../../store/store";

const BottomNav = () => {
  const location = useLocation();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="fixed bottom-0 left-0 w-full z-40 bg-darkCard/85 backdrop-blur-2xl border-t border-darkBorder/30 flex items-center justify-around h-16 md:hidden px-2 shadow-2xl transition-all duration-300">
      {/* Tab 1: Home Feed */}
      <Link
        to="/"
        className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
          isActive("/") ? "text-brandPrimary scale-105" : "text-slate-500 dark:text-slate-400"
        }`}
      >
        <svg className="h-5.5 w-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1M9 21V11m0 0H5m4 0h4m-4 0v4m0-4V7" />
        </svg>
        <span className="text-[10px] font-bold mt-1 uppercase tracking-wider">Feed</span>
      </Link>

      {/* Tab 2: Map Dashboard (Needs Auth or defaults to login, but dashboard itself is protected) */}
      <Link
        to="/dashboard"
        className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
          isActive("/dashboard") ? "text-brandPrimary scale-105" : "text-slate-500 dark:text-slate-400"
        }`}
      >
        <svg className="h-5.5 w-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
        <span className="text-[10px] font-bold mt-1 uppercase tracking-wider">Map</span>
      </Link>

      {/* Tab 3: My Incidents */}
      <Link
        to={isAuthenticated ? "/private" : "/login"}
        className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
          isActive("/private") ? "text-brandPrimary scale-105" : "text-slate-500 dark:text-slate-400"
        }`}
      >
        <svg className="h-5.5 w-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <span className="text-[10px] font-bold mt-1 uppercase tracking-wider">Private</span>
      </Link>

      {/* Tab 4: My Groups */}
      <Link
        to={isAuthenticated ? "/groups" : "/login"}
        className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
          isActive("/groups") ? "text-brandPrimary scale-105" : "text-slate-500 dark:text-slate-400"
        }`}
      >
        <svg className="h-5.5 w-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <span className="text-[10px] font-bold mt-1 uppercase tracking-wider">Groups</span>
      </Link>
    </div>
  );
};

export default BottomNav;
