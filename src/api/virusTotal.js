import axios from 'axios';

const API_KEY = process.env.REACT_APP_VIRUSTOTAL_API_KEY;
const BASE_URL = 'https://www.virustotal.com/api/v3';

const virusTotalApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    'x-apikey': API_KEY,
    'Accept': 'application/json',
    'Content-Type': 'application/x-www-form-urlencoded'
  }
});

virusTotalApi.interceptors.request.use(
  config => {
    console.log('API Request Config:', config);
    return config;
  },
  error => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);


export const scanUrl = async (url) => {
  try {
    if (!url.startsWith('http')) {
      throw new Error('URL must start with http:// or https://');
    }

    const params = new URLSearchParams();
    params.append('url', url);

    const submitResponse = await virusTotalApi.post('/urls', params);
    const analysisId = submitResponse.data.data.id;
    
    const analysisResponse = await virusTotalApi.get(`/analyses/${analysisId}`);
    
    if (analysisResponse.data.data.attributes.status === 'completed') {
      return analysisResponse.data;
    }

    return submitResponse.data;
  } catch (error) {
    console.error('VirusTotal API error:', error);
    throw new Error(error.response?.data?.error?.message || error.message || 'Failed to scan URL');
  }
};

export const getAnalysisResults = async (analysisId) => {
  try {
    const response = await virusTotalApi.get(`/analyses/${analysisId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching analysis results:', error);
    throw new Error(error.response?.data?.error?.message || error.message || 'Failed to get analysis results');
  }
};


// Helper function to validate IP address
const isValidIP = (ip) => {
  const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (!ipv4Pattern.test(ip)) return false;

  const octets = ip.split('.');
  return octets.every(octet => {
    const num = parseInt(octet, 10);
    return num >= 0 && num <= 255;
  });
};

export const scanIP = async (ip) => {
  try {
    console.log('scanIP: Scanning IP:', ip);
    
    if (!isValidIP(ip)) {
      console.error('scanIP: Invalid IP format:', ip);
      throw new Error('Invalid IP address format');
    }

    const timestamp = Date.now();
    const response = await virusTotalApi.get(`/ip_addresses/${ip}?t=${timestamp}`);
    
    if (response.data && response.data.data && response.data.data.id !== ip) {
      console.warn(`scanIP: API returned data for IP ${response.data.data.id} instead of requested IP ${ip}`);
    }
    
    console.log('scanIP: API response for IP', ip, ':', response.data);
    
    return response.data;
  } catch (error) {
    console.error(`VirusTotal IP scan error for IP ${ip}:`, error);
    throw new Error(error.response?.data?.error?.message || error.message || 'Failed to scan IP');
  }
};