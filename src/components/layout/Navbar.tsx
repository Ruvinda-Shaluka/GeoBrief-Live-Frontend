import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAppSelector } from "../../store/store";
import LiveClock from "./LiveClock";
import ProfileModal from "../profile/ProfileModal";

const Navbar = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  // Theme states
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved ? saved === "dark" : true;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  // Helper to highlight the active tab
  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Wrapper to handle the padding around the "island" */}
      <div className="fixed top-0 w-full z-40 p-4">
        {/* The Glassy Island Navbar */}
        <nav className="mx-auto max-w-7xl bg-darkCard/70 backdrop-blur-xl border border-darkBorder/60 shadow-2xl rounded-2xl px-6 h-16 flex items-center justify-between transition-all">
          {/* LEFT: Branding (flex-1 forces it to take up the left space evenly) */}
          <div className="flex-1 flex justify-start items-center">
            <Link
              to="/"
              className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white hover:opacity-80 transition-opacity"
            >
              GeoBrief<span className="text-brandPrimary">Live</span>
            </Link>
          </div>

          {/* CENTER: Navigation Links */}
          <div className="hidden md:flex justify-center space-x-8">
            <Link
              to="/"
              className={`${isActive("/") ? "text-brandPrimary border-b-2 border-brandPrimary" : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"} px-3 py-5 text-sm font-medium transition-colors`}
            >
              Public Feed
            </Link>
            <Link
              to="/dashboard"
              className={`${isActive("/dashboard") ? "text-brandPrimary border-b-2 border-brandPrimary" : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"} px-3 py-5 text-sm font-medium transition-colors`}
            >
              Map Dashboard
            </Link>
            <Link
              to="/private"
              className={`${isActive("/private") ? "text-brandPrimary border-b-2 border-brandPrimary" : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"} px-3 py-5 text-sm font-medium transition-colors`}
            >
              My Incidents
            </Link>
            <Link
              to="/groups"
              className={`${isActive("/groups") ? "text-brandPrimary border-b-2 border-brandPrimary" : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"} px-3 py-5 text-sm font-medium transition-colors`}
            >
              My Groups
            </Link>
          </div>

          {/* RIGHT: Clock & Auth (flex-1 forces it to take up the right space evenly) */}
          <div className="flex-1 flex justify-end items-center space-x-4 md:space-x-6">
            <LiveClock />

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-slate-200/50 dark:bg-slate-800/40 border border-darkBorder/20 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
              title="Toggle Theme"
            >
              {isDark ? (
                /* Sun Icon */
                <svg className="h-4.5 w-4.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                /* Moon Icon */
                <svg className="h-4.5 w-4.5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {isAuthenticated ? (
              <button
                onClick={() => setIsProfileOpen(true)}
                className="flex items-center space-x-2 focus:outline-none group"
              >
                {/* Check if the user has a profile picture from Google */}
                {user?.picture || user?.profilePicture ? (
                  <img
                    src={user.picture || user.profilePicture}
                    alt={user.name}
                    className="h-10 w-10 rounded-full object-cover border-2 border-transparent group-hover:border-purple-400 transition-all shadow-md"
                    referrerPolicy="no-referrer" // CRITICAL: This allows Google images to load without CORS blocking!
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-brandPrimary flex items-center justify-center text-white font-bold border-2 border-transparent group-hover:border-purple-400 transition-all shadow-md">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                )}
              </button>
            ) : (
              <Link
                to="/login"
                className="bg-brandPrimary hover:bg-purple-500 text-white px-6 py-2 rounded-lg text-sm font-semibold transition-colors shadow-lg"
              >
                Sign In
              </Link>
            )}
          </div>
        </nav>
      </div>

      {/* Render the Profile Modal outside the nav hierarchy */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
    </>
  );
};

export default Navbar;
