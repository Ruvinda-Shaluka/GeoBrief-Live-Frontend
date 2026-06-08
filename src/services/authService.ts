import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL + '/auth/';

// Login user (Local)
const login = async (userData: any) => {
  const response = await axios.post(API_URL + 'login', userData);
  return response.data;
};

// Register user (Local)
const register = async (userData: any) => {
  const response = await axios.post(API_URL + 'register', userData);
  return response.data;
};

// Login with Google
const googleLogin = async (token: string) => {
  const response = await axios.post(API_URL + 'google', { token });
  return response.data;
};

const authService = {
  login,
  register,
  googleLogin,
};

export default authService;