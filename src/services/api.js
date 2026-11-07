import axios from 'axios';
import { io } from 'socket.io-client';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Send httpOnly JWT cookie automatically
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for consistent error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Something went wrong. Please try again.';
    return Promise.reject(new Error(message));
  }
);

// Socket.io singleton connection
let socketInstance = null;

export const getSocket = () => {
  if (!socketInstance) {
    socketInstance = io(SOCKET_URL, {
      withCredentials: true,
      autoConnect: true,
      reconnectionAttempts: 5,
    });
  }
  return socketInstance;
};

// Auth API
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, newPassword) => api.post('/auth/reset-password', { token, newPassword }),
};

// Services & Categories API
export const servicesAPI = {
  getCategories: () => api.get('/categories'),
  getServices: (params) => api.get('/services', { params }),
  getServiceById: (id) => api.get(`/services/${id}`),
  getReviews: () => api.get('/reviews'),
};

// Providers API
export const providersAPI = {
  getProviders: (params) => api.get('/providers', { params }),
  getProviderById: (id) => api.get(`/providers/${id}`),
};

// Bookings API
export const bookingsAPI = {
  createBooking: (payload) => api.post('/bookings', payload),
  getMyBookings: (params) => api.get('/bookings/mine', { params }),
  getBookingById: (id) => api.get(`/bookings/${id}`),
  cancelBooking: (id, reason) => api.patch(`/bookings/${id}/cancel`, { reason }),
  rescheduleBooking: (id, data) => api.patch(`/bookings/${id}/reschedule`, data),
  approveQuotation: (id) => api.patch(`/bookings/${id}/quotation/approve`),
  declineQuotation: (id) => api.patch(`/bookings/${id}/quotation/decline`),
  submitReview: (id, data) => api.post(`/bookings/${id}/review`, data),
  submitComplaint: (id, data) => api.post(`/bookings/${id}/complaint`, data),
  updateStatus: (id, status, finishCode) => api.patch(`/bookings/${id}/status`, { status, finishCode }),
};

// Notifications API
export const notificationsAPI = {
  getNotifications: () => api.get('/notifications'),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
};

// Support Tickets API
export const supportAPI = {
  createTicket: (payload) => api.post('/support', payload),
  getMyTickets: () => api.get('/support/mine'),
};

// Uploads API (Multer + Cloudinary)
export const uploadAPI = {
  uploadPhotos: (files) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('photos', file);
    });
    return api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};
