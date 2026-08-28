import api from '../config/axios';

export const clinicService = {
  getAllClinics: async (params) => {
    return await api.get('/clinics', { params });
  },
  getClinicById: async (id) => {
    return await api.get(`/clinics/${id}`);
  },
  getClinicSpecialties: async (clinicId) => {
    return await api.get(`/clinics/${clinicId}/specialties`);
  },
};

export const specialtyService = {
  getAllSpecialties: async (params) => {
    return await api.get('/specialties', { params });
  },
  getSpecialtyById: async (id) => {
    return await api.get(`/specialties/${id}`);
  },
};

export const doctorService = {
  getAllDoctors: async (params) => {
    return await api.get('/doctors', { params });
  },
  getDoctorsBySpecialty: async (specialtyId, params) => {
    return await api.get(`/specialties/${specialtyId}/doctors`, { params });
  },
  getDoctorById: async (id) => {
    return await api.get(`/doctors/${id}`);
  },
};

export const slotService = {
  getDoctorSlots: async (doctorId, params) => {
    return await api.get(`/doctors/${doctorId}/slots`, { params });
  },
};

export const appointmentService = {
  createAppointment: async (bookingData) => {
    return await api.post('/appointments', bookingData);
  },
  getAppointments: async (params) => {
    return await api.get('/appointments', { params });
  },
  getAppointmentById: async (id) => {
    return await api.get(`/appointments/${id}`);
  },
  getAppointmentByCode: async (bookingCode) => {
    return await api.get(`/appointments/code/${bookingCode}`);
  },
  cancelAppointment: async (id, reasonData) => {
    return await api.post(`/appointments/${id}/cancel`, reasonData);
  },
};

export const aiService = {
  suggestSpecialty: async (symptomDescription) => {
    return await api.post('/ai/suggest-specialty', { symptomDescription });
  },
};

