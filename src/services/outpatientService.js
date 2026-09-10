import api from '../config/axios';

export const outpatientService = {
  checkIn: async (appointmentId) => {
    return await api.post('/outpatient/receptionist/check-in', { appointmentId });
  },

  recordVitalSigns: async (data) => {
    return await api.post('/outpatient/assistant/vital-signs', data);
  },

  saveClinicalNote: async (data) => {
    return await api.post('/outpatient/assistant/clinical-notes', data);
  },

  createClinicalOrder: async (data) => {
    return await api.post('/outpatient/doctor/clinical-orders', data);
  },

  payInvoice: async (invoiceId) => {
    return await api.post(`/outpatient/receptionist/invoices/${invoiceId}/pay`);
  },

  submitDiagnosticResult: async (data) => {
    return await api.post('/outpatient/technician/results', data);
  },

  finalizeVisit: async (visitId, wrapperData) => {
    return await api.post(`/outpatient/doctor/finalize-visit?visitId=${visitId}`, wrapperData);
  },

  getVisitDetail: async (visitId) => {
    return await api.get(`/outpatient/visits/${visitId}`);
  },

  getVisitByAppointmentId: async (appointmentId) => {
    return await api.get(`/outpatient/visits/appointment/${appointmentId}`);
  },

  getEncounterQueueByRoom: async (roomId, status = 'WAITING') => {
    return await api.get(`/outpatient/queue/encounters?roomId=${roomId}&status=${status}`);
  },

  getTaskQueueByRoom: async (roomId, status = 'READY') => {
    return await api.get(`/outpatient/queue/tasks?roomId=${roomId}&status=${status}`);
  },

  getConfirmedAppointments: async (status = 'CONFIRMED') => {
    return await api.get(`/partner/appointments?status=${status}`);
  },

  getCatalog: async (clinicId = 1) => {
    return await api.get(`/outpatient/catalog?clinicId=${clinicId}`);
  },

  getRooms: async (clinicId = 1) => {
    return await api.get(`/outpatient/rooms?clinicId=${clinicId}`);
  },

  getPatientHistory: async (patientProfileId) => {
    return await api.get(`/outpatient/patient-history/${patientProfileId}`);
  },

  startEncounter: async (encounterId) => {
    return await api.post(`/outpatient/encounters/${encounterId}/start`);
  },
};
