import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

export const analyzeRisk = (data) => API.post('/analyze', data);
export const saveReport = (data) => API.post('/save', data);
export const getHistory = (username) => API.get(`/history/${username}`);
