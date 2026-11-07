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

// Response interceptor for consistent error handling and password-change redirects
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.data?.code === 'MUST_CHANGE_PASSWORD') {
      if (typeof window !== 'undefined' && window.location.pathname !== '/change-password') {
        window.location.href = '/change-password';
      }
    }
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
  changePassword: (data) => api.patch('/auth/change-password', data),
};

// Payments & Checkout API
export const paymentsAPI = {
  getConfig: () => api.get('/payments/config'),
  createOrder: (bookingId) => api.post('/payments/order', { bookingId }),
  verifyPayment: (data) => api.post('/payments/verify', data),
  confirmCash: (bookingId) => api.post('/payments/cash-confirm', { bookingId }),
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
  getMyProfile: () => api.get('/providers/me'),
  registerProfile: (data) => api.post('/providers/register', data),
  updateOnlineStatus: (isOnline) => api.patch('/providers/me/status', { isOnline }),
  getPrivateDocumentSignedUrl: (type, providerId) =>
    api.get(`/providers/documents/${type}${providerId ? `?providerId=${providerId}` : ''}`),
};

// Bookings API
export const bookingsAPI = {
  createBooking: (payload) => api.post('/bookings', payload),
  getMyBookings: (params) => api.get('/bookings/mine', { params }),
  getBookingById: (id) => api.get(`/bookings/${id}`),
  cancelBooking: (id, reason) => api.patch(`/bookings/${id}/cancel`, { reason }),
  rescheduleBooking: (id, data) => api.patch(`/bookings/${id}/reschedule`, data),
  createQuotation: (id, payload) => api.post(`/bookings/${id}/quotation`, payload),
  approveQuotation: (id) => api.patch(`/bookings/${id}/quotation/approve`),
  declineQuotation: (id) => api.patch(`/bookings/${id}/quotation/decline`),
  submitReview: (id, data) => api.post(`/bookings/${id}/review`, data),
  submitComplaint: (id, data) => api.post(`/bookings/${id}/complaint`, data),
  updateStatus: (id, status, finishCode) => api.patch(`/bookings/${id}/status`, { status, finishCode }),
  declineBooking: (id) => api.patch(`/bookings/${id}/decline`),
};

// Skill Test API
export const skillTestAPI = {
  startTest: (categoryId) => api.get(`/skill-test/${categoryId}`),
  submitTest: (categoryId, payload) => api.post(`/skill-test/${categoryId}/submit`, payload),
};

// Platform Settings API
export const settingsAPI = {
  getSettings: () => api.get('/settings'),
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

// Admin API (Phase D)
export const adminAPI = {
  // 1. Dashboard Stats
  getStats: () => api.get('/admin/stats'),

  // 2. Approvals Desk
  getApprovals: () => api.get('/admin/approvals'),
  getProviderDetails: (id) => api.get(`/admin/providers/${id}`),
  approveProvider: (id) => api.post(`/admin/approvals/${id}/approve`),
  rejectProvider: (id, reason) => api.post(`/admin/approvals/${id}/reject`, { reason }),
  requestProviderInfo: (id, message) => api.post(`/admin/approvals/${id}/request-info`, { message }),

  // 3. Providers Desk
  getProviders: (params) => api.get('/admin/providers', { params }),
  suspendProvider: (id, reason) => api.post(`/admin/providers/${id}/suspend`, { reason }),
  reinstateProvider: (id, reason) => api.post(`/admin/providers/${id}/reinstate`, { reason }),

  // 4. Customers Desk
  getCustomers: (params) => api.get('/admin/customers', { params }),
  blockCustomer: (id, reason) => api.post(`/admin/customers/${id}/block`, { reason }),
  unblockCustomer: (id) => api.post(`/admin/customers/${id}/unblock`),

  // 5. Bookings Desk
  getBookings: (params) => api.get('/admin/bookings', { params }),
  getBookingDetails: (id) => api.get(`/admin/bookings/${id}`),
  cancelBooking: (id, reason) => api.post(`/admin/bookings/${id}/cancel`, { reason }),
  reassignBooking: (id, providerId) => api.post(`/admin/bookings/${id}/reassign`, { providerId }),

  // 6. Services & Categories Desk
  getCategories: () => api.get('/admin/categories'),
  createCategory: (data) => api.post('/admin/categories', data),
  updateCategory: (id, data) => api.patch(`/admin/categories/${id}`, data),
  getServices: (params) => api.get('/admin/services', { params }),
  createService: (data) => api.post('/admin/services', data),
  updateService: (id, data) => api.patch(`/admin/services/${id}`, data),
  toggleServiceStatus: (id) => api.patch(`/admin/services/${id}/status`),

  // 7. Question Bank Desk
  getQuestions: (params) => api.get('/admin/questions', { params }),
  getQuestionCounts: () => api.get('/admin/questions/counts'),
  createQuestion: (data) => api.post('/admin/questions', data),
  updateQuestion: (id, data) => api.patch(`/admin/questions/${id}`, data),
  deleteQuestion: (id) => api.delete(`/admin/questions/${id}`),

  // 8. Settings Desk
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (data) => api.patch('/admin/settings', data),

  // 9. Complaints / Disputes Desk
  getDisputes: (params) => api.get('/admin/disputes', { params }),
  getDisputeDetails: (id) => api.get(`/admin/disputes/${id}`),
  resolveDispute: (id, data) => api.post(`/admin/disputes/${id}/resolve`, data),

  // 10. Reviews Moderation Desk
  getReviews: (params) => api.get('/admin/reviews', { params }),
  toggleReviewVisibility: (id, data) => api.patch(`/admin/reviews/${id}/visibility`, data),

  // 11. Admins Management Desk
  getAdmins: () => api.get('/admin/admins'),
  createAdmin: (data) => api.post('/admin/admins', data),
  deactivateAdmin: (id) => api.post(`/admin/admins/${id}/deactivate`),

  // 12. Audit Logs Desk
  getAuditLogs: (params) => api.get('/admin/audit-logs', { params }),
};
