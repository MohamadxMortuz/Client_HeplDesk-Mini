import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:5000/api' });

export const setAuth = (token) => { api.defaults.headers.common['Authorization'] = token ? `Bearer ${token}` : undefined; };
export default api;
