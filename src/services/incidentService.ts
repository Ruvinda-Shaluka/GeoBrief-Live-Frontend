import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL + '/incidents/';

// Helper to construct auth headers
const getAuthHeaders = (token: string) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

// Get all public incidents (sorted by upvotes)
const getPublicIncidents = async () => {
  const response = await axios.get(API_URL + 'public');
  return response.data;
};

// Get authenticated incidents (public + private + user group incidents)
const getIncidents = async (token: string) => {
  const response = await axios.get(API_URL, getAuthHeaders(token));
  return response.data;
};

// Create a new incident
const createIncident = async (incidentData: {
  title: string;
  description: string;
  type: string;
  visibility: 'public' | 'private' | 'group';
  sharedWithGroups?: string[];
  coordinates: [number, number]; // [longitude, latitude]
}, token: string) => {
  const response = await axios.post(API_URL, incidentData, getAuthHeaders(token));
  return response.data;
};

// Toggle upvote
const toggleUpvote = async (incidentId: string, token: string) => {
  const response = await axios.put(API_URL + `${incidentId}/upvote`, {}, getAuthHeaders(token));
  return response.data;
};

const incidentService = {
  getPublicIncidents,
  getIncidents,
  createIncident,
  toggleUpvote,
};

export default incidentService;
