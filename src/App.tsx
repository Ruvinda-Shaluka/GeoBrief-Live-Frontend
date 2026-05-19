import { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [apiStatus, setApiStatus] = useState<string>("Pinging servers...");
  const [isConnected, setIsConnected] = useState<boolean>(false);

  useEffect(() => {
    // Ping the backend we set up earlier
    axios.get('http://localhost:5000/api/status')
      .then(response => {
        setApiStatus(response.data.message);
        setIsConnected(true);
      })
      .catch(error => {
        setApiStatus("Connection failed. Is the backend running?");
        console.error(error);
      });
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-darkCard border border-darkBorder rounded-2xl shadow-2xl p-8 text-center">
        {/* Animated Logo Placeholder */}
        <div className="relative w-24 h-24 mx-auto mb-6">
          <div className="absolute inset-0 bg-brandPrimary rounded-full animate-ping opacity-20"></div>
          <div className="relative w-full h-full bg-brandPrimary rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.5)]">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
          </div>
        </div>

        <h1 className="text-3xl font-bold tracking-tight mb-2">
          GeoBrief<span className="text-brandPrimary">Live</span>
        </h1>
        
        <div className={`mt-6 p-4 rounded-lg border ${isConnected ? 'bg-emerald-900/20 border-emerald-500/30' : 'bg-red-900/20 border-red-500/30'}`}>
          <p className={`font-mono text-sm ${isConnected ? 'text-emerald-400' : 'text-red-400'}`}>
            {apiStatus}
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;