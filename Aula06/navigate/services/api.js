// services/api.js
import axios from 'axios';

// Crie uma instância do Axios com configurações padrão
const api = axios.create({
  baseURL: 'http://192.168.2.58:3000/v1', // Sua URL base
  timeout: 10000, // Timeout de 10 segundos
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;