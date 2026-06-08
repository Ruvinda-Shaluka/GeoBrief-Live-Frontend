import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAppSelector } from "../../store/store";
import LiveClock from "./LiveClock";
import ProfileModal from "../profile/ProfileModal";

const Navbar = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

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
              className="text-2xl font-bold tracking-tight text-white hover:opacity-80 transition-opacity"
            >
              GeoBrief<span className="text-brandPrimary">Live</span>
            </Link>
          </div>

          {/* CENTER: Navigation Links */}
          <div className="hidden md:flex justify-center space-x-8">
            <Link
              to="/"
              className={`${isActive("/") ? "text-brandPrimary border-b-2 border-brandPrimary" : "text-slate-300 hover:text-white"} px-3 py-5 text-sm font-medium transition-colors`}
            >
              Public Feed
            </Link>
            <Link
              to="/private"
              className={`${isActive("/private") ? "text-brandPrimary border-b-2 border-brandPrimary" : "text-slate-300 hover:text-white"} px-3 py-5 text-sm font-medium transition-colors`}
            >
              My Incidents
            </Link>
            <Link
              to="/groups"
              className={`${isActive("/groups") ? "text-brandPrimary border-b-2 border-brandPrimary" : "text-slate-300 hover:text-white"} px-3 py-5 text-sm font-medium transition-colors`}
            >
              My Groups
            </Link>
          </div>

          {/* RIGHT: Clock & Auth (flex-1 forces it to take up the right space evenly) */}
          <div className="flex-1 flex justify-end items-center space-x-6">
            <LiveClock />

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
