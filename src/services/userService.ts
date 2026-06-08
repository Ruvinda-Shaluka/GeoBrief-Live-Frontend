import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL + '/users/profile';

// Update user profile
const updateProfile = async (userData: { name?: string; password?: string }, token: string) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.put(API_URL, userData, config);
  return response.data;
};

// Delete user account
const deleteProfile = async (token: string) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.delete(API_URL, config);
  return response.data;
};

const userService = {
  updateProfile,
  deleteProfile,
};

export default userService;