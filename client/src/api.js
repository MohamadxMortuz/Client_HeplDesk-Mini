import axios from 'axios';

// Determine API base URL:
// - Use REACT_APP_API_URL if provided (Netlify/CI env)
// - If running on localhost, default to local server
// - Otherwise default to the deployed Render API
const isLocalhost = typeof window !== 'undefined' && /^(localhost|127\.0\.0\.1)$/i.test(window.location.hostname);
const defaultProdApi = 'https://server-helpdesk-mini.onrender.com/api';
const defaultDevApi = 'http://localhost:5000/api';
const baseURL = process.env.REACT_APP_API_URL || (isLocalhost ? defaultDevApi : defaultProdApi);

const api = axios.create({ baseURL });

export const setAuth = (token) => { api.defaults.headers.common['Authorization'] = token ? `Bearer ${token}` : undefined; };
export default api;
