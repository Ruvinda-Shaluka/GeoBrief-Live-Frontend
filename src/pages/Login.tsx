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
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/25 rounded-xl text-rose-600 dark:text-rose-400 text-sm text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLocalAuth} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-darkTextSecondary mb-1">Full Name</label>
              <input 
                type="text" 
                required
                className="w-full bg-darkBg border border-darkBorder rounded-lg px-4 py-2 text-darkText focus:outline-none focus:border-brandPrimary focus:ring-1 focus:ring-brandPrimary transition-colors"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-darkTextSecondary mb-1">Email</label>
            <input 
              type="email" 
              required
              className="w-full bg-darkBg border border-darkBorder rounded-lg px-4 py-2 text-darkText focus:outline-none focus:border-brandPrimary focus:ring-1 focus:ring-brandPrimary transition-colors"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-darkTextSecondary mb-1">Password</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                required
                minLength={6} 
                className="w-full bg-darkBg border border-darkBorder rounded-lg pl-4 pr-10 py-2 text-darkText focus:outline-none focus:border-brandPrimary focus:ring-1 focus:ring-brandPrimary transition-colors"
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
            className="w-full bg-brandPrimary hover:bg-purple-500 text-white font-semibold py-2.5 rounded-lg transition-colors mt-2 cursor-pointer"
          >
            {isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button 
            onClick={() => {
              setIsLogin(!isLogin);
              setError(''); 
            }}
            className="text-sm text-darkTextSecondary hover:text-darkText transition-colors focus:outline-none cursor-pointer font-semibold"
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