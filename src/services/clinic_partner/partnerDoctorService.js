import api from '../../config/axios';

export const partnerDoctorService = {
  getDoctors: async (params = {}) => {
    return await api.get('/partner/doctors', { params });
  },
  getDoctorById: async (id) => {
    return await api.get(`/partner/doctors/${id}`);
  },
  createDoctor: async (doctorData) => {
    return await api.post('/partner/doctors', doctorData);
  },
  updateDoctor: async (id, doctorData) => {
    return await api.put(`/partner/doctors/${id}`, doctorData);
  },
  updateDoctorStatus: async (id, status) => {
    return await api.patch(`/partner/doctors/${id}/status`, null, {
      params: { status },
    });
  },
};
