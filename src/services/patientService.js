import api from '../config/axios';

export const patientService = {
  getPatients: async (keyword = '') => {
    const params = keyword ? { keyword } : {};
    return await api.get('/patients', { params });
  },

  getPatientById: async (id) => {
    return await api.get(`/patients/${id}`);
  },

  createPatient: async (patientData) => {
    return await api.post('/patients', patientData);
  },

  updatePatient: async (id, patientData) => {
    return await api.put(`/patients/${id}`, patientData);
  },

  deletePatient: async (id) => {
    return await api.delete(`/patients/${id}`);
  },
};
