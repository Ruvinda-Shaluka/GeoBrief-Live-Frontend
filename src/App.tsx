import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { type ReactNode } from 'react'; // Import ReactNode (using type-only import for your strict TS config)
import { useAppSelector } from './store/store';
import Login from './pages/Login';

// Update JSX.Element to ReactNode here
const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const Dashboard = () => (
  <div className="min-h-screen flex items-center justify-center">
    <h1 className="text-2xl">Map Dashboard Coming Soon!</h1>
  </div>
);

function App() {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} 
        />
        <Route path="/login" element={<Login />} />
        
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;