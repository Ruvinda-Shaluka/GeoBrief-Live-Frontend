import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL + '/ai/';

const getBriefSummary = async (incidents: string[], token: string | null): Promise<string> => {
  const config = token
    ? {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    : undefined;

  const response = await axios.post(API_URL + 'brief', { incidents }, config);
  return response.data.summary;
};

const aiService = {
  getBriefSummary,
};

export default aiService;
