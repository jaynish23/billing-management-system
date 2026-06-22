import api from './api';

export const authService = {
  login: async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  sendOtp: async (email) => {
    const response = await api.post('/auth/send-otp', { email });
    return response.data;
  },
  verifyOtp: async (email, otp) => {
    // ensuring string to int safely
    const response = await api.post('/auth/verify-otp', { email, otp: parseInt(otp, 10) });
    return response.data;
  }
};
