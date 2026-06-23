import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAppDispatch } from '../store/store';
import { setCredentials } from '../store/slices/authSlice';
import authService from '../services/authService';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  // New state to track if the user is holding down the password peek button
  const [showPassword, setShowPassword] = useState(false);
  
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLocalAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    
    try {
      let data;
      if (isLogin) {
        data = await authService.login({ email, password });
      } else {
        data = await authService.register({ name, email, password });
      }
      
      dispatch(setCredentials({ user: data, token: data.token }));
      navigate('/dashboard'); 
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to ${isLogin ? 'login' : 'register'}`);
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
      <div className="w-full max-w-md bg-darkCard border-2 border-darkBorder rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-darkText tracking-tight mb-2">
            Welcome to GeoBrief<span className="text-brandPrimary">Live</span>
          </h1>
          <p className="text-darkTextSecondary text-sm">
            {isLogin ? 'Sign in to report and track local incidents.' : 'Create an account to join the community.'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 border-2 border-rose-500/35 rounded-xl text-rose-600 dark:text-rose-400 text-sm text-left font-medium flex items-start gap-3 animate-fadeIn">
            <svg className="h-5 w-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLocalAuth} className="space-y-5">
          {!isLogin && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-darkTextSecondary mb-1.5">Full Name</label>
              <input 
                type="text" 
                required
                className={`w-full bg-darkBg border rounded-xl px-4 py-2.5 text-sm text-darkText focus:outline-none transition-colors ${
                  error ? "border-rose-500/50 focus:border-rose-500 focus:ring-1 focus:ring-rose-500" : "border-darkBorder focus:border-brandPrimary focus:ring-1 focus:ring-brandPrimary"
                }`}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-darkTextSecondary mb-1.5">Email Address</label>
            <input 
              type="email" 
              required
              className={`w-full bg-darkBg border rounded-xl px-4 py-2.5 text-sm text-darkText focus:outline-none transition-colors ${
                error ? "border-rose-500/50 focus:border-rose-500 focus:ring-1 focus:ring-rose-500" : "border-darkBorder focus:border-brandPrimary focus:ring-1 focus:ring-brandPrimary"
              }`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-darkTextSecondary mb-1.5">Password</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                required
                minLength={6} 
                className={`w-full bg-darkBg border rounded-xl pl-4 pr-10 py-2.5 text-sm text-darkText focus:outline-none transition-colors ${
                  error ? "border-rose-500/50 focus:border-rose-500 focus:ring-1 focus:ring-rose-500" : "border-darkBorder focus:border-brandPrimary focus:ring-1 focus:ring-brandPrimary"
                }`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {/* Hold-to-view Eye Button */}
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-darkTextSecondary hover:text-darkText transition-colors cursor-pointer"
                onMouseDown={() => setShowPassword(true)}
                onMouseUp={() => setShowPassword(false)}
                onMouseLeave={() => setShowPassword(false)} // Hides it if they drag mouse away before letting go
                onTouchStart={() => setShowPassword(true)}  // For mobile devices
                onTouchEnd={() => setShowPassword(false)}   // For mobile devices
                title="Hold to show password"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
          </div>
          
          <button 
            type="submit" 
            className="w-full bg-brandPrimary hover:bg-teal-800 dark:hover:bg-teal-400 text-white dark:text-slate-950 font-bold py-3 rounded-xl transition-all shadow-lg shadow-brandPrimary/20 hover:shadow-brandPrimary/30 dark:shadow-none hover:scale-[1.01] active:scale-[0.99] mt-3 cursor-pointer select-none"
          >
            {isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-6 text-center border-t border-darkBorder/40 pt-4">
          <button 
            onClick={() => {
              setIsLogin(!isLogin);
              setError(''); 
            }}
            className="text-sm text-darkTextSecondary hover:text-darkText transition-colors focus:outline-none cursor-pointer font-bold"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>

        <div className="mt-6 flex items-center">
          <div className="grow border-t-2 border-darkBorder"></div>
          <span className="mx-4 text-sm text-darkTextSecondary font-bold">OR</span>
          <div className="grow border-t-2 border-darkBorder"></div>
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