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

const getSafetyTip = async (
  incidentData: { title: string; category: string },
  token: string | null
): Promise<string> => {
  const config = token
    ? {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    : undefined;

  const response = await axios.post(API_URL + 'safety-tip', incidentData, config);
  return response.data.tip;
};

const aiService = {
  getBriefSummary,
  getSafetyTip,
};

export default aiService;
