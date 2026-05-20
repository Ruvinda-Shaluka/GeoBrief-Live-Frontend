import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAppDispatch } from '../store/store';
import { setCredentials } from '../store/slices/authSlice';
import authService from '../services/authService';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLocalLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const data = await authService.login({ email, password });
      dispatch(setCredentials({ user: data, token: data.token }));
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to login');
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const data = await authService.googleLogin(credentialResponse.credential);
      dispatch(setCredentials({ user: data, token: data.token }));
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Google Auth Failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-darkCard border border-darkBorder rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Welcome to GeoBrief<span className="text-brandPrimary">Live</span>
          </h1>
          <p className="text-slate-400 text-sm">Sign in to report and track local incidents.</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/20 border border-red-500/30 rounded text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLocalLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
            <input 
              type="email" 
              required
              className="w-full bg-darkBg border border-darkBorder rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brandPrimary focus:ring-1 focus:ring-brandPrimary transition-colors"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
            <input 
              type="password" 
              required
              className="w-full bg-darkBg border border-darkBorder rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brandPrimary focus:ring-1 focus:ring-brandPrimary transition-colors"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          <button 
            type="submit" 
            className="w-full bg-brandPrimary hover:bg-purple-500 text-white font-semibold py-2.5 rounded-lg transition-colors mt-2"
          >
            Sign In
          </button>
        </form>

        <div className="mt-6 flex items-center">
          <div className="flex-grow border-t border-darkBorder"></div>
          <span className="mx-4 text-sm text-slate-500">OR</span>
          <div className="flex-grow border-t border-darkBorder"></div>
        </div>

        <div className="mt-6 flex justify-center">
          <GoogleLogin 
            onSuccess={handleGoogleSuccess} 
            onError={() => setError('Google Login Failed')} 
            theme="filled_black"
            shape="rectangular"
            text="continue_with"
          />
        </div>
      </div>
    </div>
  );
};

export default Login;