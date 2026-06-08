import { Routes, Route, Navigate } from 'react-router-dom';
import { type ReactNode } from 'react';
import { useAppSelector } from '../store/store';
import Login from '../pages/Login';

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const Home = () => (
  <div className="flex items-center justify-center h-[60vh]">
    <div className="text-center">
      <h1 className="text-4xl font-bold tracking-tight mb-4">
        Welcome to GeoBrief<span className="text-brandPrimary">Live</span>
      </h1>
      <p className="text-slate-400">Public incident feed coming soon...</p>
    </div>
  </div>
);

const PrivateIncidents = () => (
  <div className="flex items-center justify-center h-[60vh]">
    <h1 className="text-3xl text-brandPrimary">Private Incidents Coming Soon</h1>
  </div>
);

const GroupManager = () => (
  <div className="flex items-center justify-center h-[60vh]">
    <h1 className="text-3xl text-brandPrimary">Group Management Coming Soon</h1>
  </div>
);

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      
      {/* Protected Routes */}
      <Route path="/private" element={<ProtectedRoute><PrivateIncidents /></ProtectedRoute>} />
      <Route path="/groups" element={<ProtectedRoute><GroupManager /></ProtectedRoute>} />
      
      {/* Catch-all redirect to home */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRoutes;