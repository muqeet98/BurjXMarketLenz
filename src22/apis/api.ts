// src/services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://coingeko.burjx.com',
  timeout: 10000,
});

export default api;
