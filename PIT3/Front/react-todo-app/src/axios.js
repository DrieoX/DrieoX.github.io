import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api/', // Updated base URL for your Django API
  headers: {
    'Content-Type': 'application/json',
    // Add other headers as needed, e.g., Authorization: `Bearer ${token}`
  },
});

export default api;
