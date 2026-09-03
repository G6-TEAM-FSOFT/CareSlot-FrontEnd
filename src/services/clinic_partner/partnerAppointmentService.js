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
};
