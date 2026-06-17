import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAppSelector } from "../../store/store";
import LiveClock from "./LiveClock";
import ProfileModal from "../profile/ProfileModal";

const Navbar = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
        <nav className="mx-auto max-w-7xl bg-darkCard/90 backdrop-blur-xl border-2 border-darkBorder shadow-2xl rounded-2xl px-6 h-16 flex items-center justify-between transition-all">
          {/* LEFT: Branding */}
          <div className="flex-[0.8] flex justify-start items-center">
            <Link
              to="/"
              className="text-2xl font-bold tracking-tight text-darkText hover:opacity-80 transition-opacity"
            >
              GeoBrief<span className="text-brandPrimary">Live</span>
            </Link>
          </div>

          {/* CENTER: Navigation Links */}
          <div className="hidden md:flex justify-center space-x-8">
            <Link
              to="/"
              className={`${isActive("/") ? "text-brandPrimary border-b-2 border-brandPrimary" : "text-darkTextSecondary hover:text-darkText"} px-3 py-5 text-sm font-semibold transition-colors`}
            >
              Public Feed
            </Link>
            <Link
              to="/dashboard"
              className={`${isActive("/dashboard") ? "text-brandPrimary border-b-2 border-brandPrimary" : "text-darkTextSecondary hover:text-darkText"} px-3 py-5 text-sm font-semibold transition-colors`}
            >
              Map Dashboard
            </Link>
            <Link
              to="/private"
              className={`${isActive("/private") ? "text-brandPrimary border-b-2 border-brandPrimary" : "text-darkTextSecondary hover:text-darkText"} px-3 py-5 text-sm font-semibold transition-colors`}
            >
              My Incidents
            </Link>
            <Link
              to="/groups"
              className={`${isActive("/groups") ? "text-brandPrimary border-b-2 border-brandPrimary" : "text-darkTextSecondary hover:text-darkText"} px-3 py-5 text-sm font-semibold transition-colors`}
            >
              My Groups
            </Link>
          </div>

          {/* RIGHT: Desktop Controls / Mobile Hamburger */}
          <div className="flex-[1.2] flex justify-end items-center space-x-4 md:space-x-6">
            {/* Desktop-only items */}
            <div className="hidden md:flex items-center space-x-4 md:space-x-6">
              <LiveClock />

              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-xl bg-slate-200/50 dark:bg-slate-800/40 border border-darkBorder hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
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

              {/* Profile button */}
              {isAuthenticated ? (
                <button
                  onClick={() => setIsProfileOpen(true)}
                  className="flex items-center space-x-2 focus:outline-none group"
                >
                  {user?.picture || user?.profilePicture ? (
                    <img
                      src={user.picture || user.profilePicture}
                      alt={user.name}
                      className="h-10 w-10 rounded-full object-cover border-2 border-transparent group-hover:border-purple-400 transition-all shadow-md"
                      referrerPolicy="no-referrer"
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

            {/* Mobile Hamburger menu button (placed on the right) */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2.5 rounded-xl bg-slate-200/50 dark:bg-slate-800/40 border border-darkBorder text-darkTextSecondary hover:bg-brandPrimary/10 hover:text-darkText transition-all cursor-pointer"
              aria-label="Toggle Mobile Menu"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile Menu (Collapsible/Retractable) */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed top-20 left-4 right-4 z-40 bg-darkCard/95 backdrop-blur-2xl border-2 border-darkBorder rounded-2xl p-5 shadow-2xl animate-fadeIn">
          <div className="flex flex-col space-y-3">
            <Link
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`${isActive("/") ? "text-brandPrimary bg-brandPrimary/10" : "text-darkText hover:bg-brandPrimary/10"} px-4 py-2.5 rounded-xl text-sm font-semibold transition-all`}
            >
              Public Feed
            </Link>
            <Link
              to="/dashboard"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`${isActive("/dashboard") ? "text-brandPrimary bg-brandPrimary/10" : "text-darkText hover:bg-brandPrimary/10"} px-4 py-2.5 rounded-xl text-sm font-semibold transition-all`}
            >
              Map Dashboard
            </Link>
            <Link
              to="/private"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`${isActive("/private") ? "text-brandPrimary bg-brandPrimary/10" : "text-darkText hover:bg-brandPrimary/10"} px-4 py-2.5 rounded-xl text-sm font-semibold transition-all`}
            >
              My Incidents
            </Link>
            <Link
              to="/groups"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`${isActive("/groups") ? "text-brandPrimary bg-brandPrimary/10" : "text-darkText hover:bg-brandPrimary/10"} px-4 py-2.5 rounded-xl text-sm font-semibold transition-all`}
            >
              My Groups
            </Link>

            <div className="border-t border-darkBorder/40 my-2" />

            {/* Mobile Theme Toggle Section */}
            <div className="flex items-center justify-between px-4 py-1.5">
              <span className="text-sm font-bold text-darkText">Theme Mode</span>
              <button
                onClick={toggleTheme}
                className="px-4 py-2 rounded-xl bg-slate-200/50 dark:bg-slate-800/40 border border-darkBorder hover:bg-slate-200 dark:hover:bg-slate-800 transition-all cursor-pointer"
              >
                {isDark ? (
                  <span className="flex items-center space-x-2 text-xs font-semibold text-amber-500">
                    <svg className="h-4.5 w-4.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Light Mode</span>
                  </span>
                ) : (
                  <span className="flex items-center space-x-2 text-xs font-semibold text-indigo-500">
                    <svg className="h-4.5 w-4.5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                    <span>Dark Mode</span>
                  </span>
                )}
              </button>
            </div>

            {/* Mobile Profile Toggle Section */}
            <div className="flex items-center justify-between px-4 py-1.5">
              <span className="text-sm font-bold text-darkText">Account Profile</span>
              {isAuthenticated ? (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsProfileOpen(true);
                  }}
                  className="flex items-center space-x-2.5 focus:outline-none group border border-darkBorder px-3 py-1.5 rounded-xl bg-slate-200/30 dark:bg-slate-800/30"
                >
                  {user?.picture || user?.profilePicture ? (
                    <img
                      src={user.picture || user.profilePicture}
                      alt={user.name}
                      className="h-8 w-8 rounded-full object-cover border-2 border-transparent group-hover:border-purple-400 transition-all"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-brandPrimary flex items-center justify-center text-white font-bold">
                      {user?.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                  )}
                  <span className="text-xs text-darkText font-semibold">{user?.name}</span>
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="bg-brandPrimary hover:bg-purple-500 text-white px-5 py-2 rounded-xl text-xs font-bold transition-colors"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Render the Profile Modal outside the nav hierarchy */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
    </>
  );
};

export default Navbar;
