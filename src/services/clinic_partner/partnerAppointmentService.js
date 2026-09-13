import api from '../../config/axios';

export const partnerAppointmentService = {
  getAppointments: async (params = {}) => {
    return await api.get('/partner/appointments', { params });
  },
  getAppointmentDetail: async (id) => {
    return await api.get(`/partner/appointments/${id}`);
  },
  getAppointmentLifecycleLogs: async (id) => {
    return await api.get(`/partner/appointments/${id}/logs`);
  },
  checkInAppointment: async (id) => {
    return await api.patch(`/partner/appointments/${id}/check-in`);
  },
  getReplacementSlots: async (id) => {
    return await api.get(`/partner/appointments/${id}/replacement-slots`);
  },
  reassignDoctor: async (id, data) => {
    return await api.patch(`/partner/appointments/${id}/reassign`, data);
  },
};
