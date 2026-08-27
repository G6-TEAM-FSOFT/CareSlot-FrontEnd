import api from '../config/axios';

export const clinicService = {
  getAllClinics: async (params) => {
    return await api.get('/clinics', { params });
  },
  getClinicById: async (id) => {
    return await api.get(`/clinics/${id}`);
  },
};

export const doctorService = {
  getDoctorsByClinic: async (clinicId) => {
    return await api.get(`/doctors/clinic/${clinicId}`);
  },
  getDoctorById: async (id) => {
    return await api.get(`/doctors/${id}`);
  },
};

export const slotService = {
  getSlotsByDoctor: async (doctorId) => {
    return await api.get(`/slots/doctor/${doctorId}`);
  },
  holdSlot: async (slotId) => {
    return await api.post(`/slots/${slotId}/hold`);
  },
};

export const appointmentService = {
  createAppointment: async (bookingData) => {
    return await api.post('/appointments', bookingData);
  },
  getUserAppointments: async () => {
    return await api.get('/appointments/my-history');
  },
  checkIn: async (appointmentId) => {
    return await api.post(`/appointments/${appointmentId}/check-in`);
  },
};

export const aiService = {
  suggestSpecialty: async (symptomDescription) => {
    return await api.post('/ai/suggest-specialty', { symptomDescription });
  },
};
