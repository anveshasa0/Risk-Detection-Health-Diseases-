import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

const API = axios.create({
	baseURL: API_BASE_URL,
	timeout: 15000
});

API.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response?.data?.message) {
			error.message = error.response.data.message;
		}
		return Promise.reject(error);
	}
);

export const analyzeRisk = (data) => API.post('/analyze', data);
export const saveReport = (data) => API.post('/save', data);
export const getHistory = (username) => API.get(`/history/${username}`);
export const getInsights = (username) => API.get(`/insights/${username}`);
