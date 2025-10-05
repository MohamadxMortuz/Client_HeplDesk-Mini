import axios from 'axios';

const api = axios.create({ baseURL: 'https://server-helpdesk-mini.onrender.com' });

export const setAuth = (token) => { api.defaults.headers.common['Authorization'] = token ? `Bearer ${token}` : undefined; };
export default api;
