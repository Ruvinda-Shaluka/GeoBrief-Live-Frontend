import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL + '/groups/';

// Helper to construct auth headers
const getAuthHeaders = (token: string) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

// Create a group
const createGroup = async (groupData: { name: string; description?: string }, token: string) => {
  const response = await axios.post(API_URL, groupData, getAuthHeaders(token));
  return response.data;
};

// Get all groups the user is a member/admin of
const getUserGroups = async (token: string) => {
  const response = await axios.get(API_URL, getAuthHeaders(token));
  return response.data;
};

// Add a member to group by email
const addMemberToGroup = async (groupId: string, email: string, token: string) => {
  const response = await axios.post(API_URL + `${groupId}/members`, { email }, getAuthHeaders(token));
  return response.data;
};

// Transfer admin privilege/ownership to another member
const transferGroupAdmin = async (groupId: string, newAdminId: string, token: string) => {
  const response = await axios.put(API_URL + `${groupId}/admin`, { newAdminId }, getAuthHeaders(token));
  return response.data;
};

// Remove a member from the group (admin action)
const removeMember = async (groupId: string, memberId: string, token: string) => {
  const response = await axios.delete(API_URL + `${groupId}/members/${memberId}`, getAuthHeaders(token));
  return response.data;
};

// Leave the group (member action)
const leaveGroup = async (groupId: string, token: string) => {
  const response = await axios.post(API_URL + `${groupId}/leave`, {}, getAuthHeaders(token));
  return response.data;
};

const groupService = {
  createGroup,
  getUserGroups,
  addMemberToGroup,
  transferGroupAdmin,
  removeMember,
  leaveGroup,
};

export default groupService;
