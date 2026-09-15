import api from '../../config/axios';

export const partnerRoomService = {
  getRooms: async () => {
    return await api.get('/partner/rooms');
  },
  getRoomDetail: async (id) => {
    return await api.get(`/partner/rooms/${id}`);
  },
  createRoom: async (data) => {
    return await api.post('/partner/rooms', data);
  },
  updateRoom: async (id, data) => {
    return await api.put(`/partner/rooms/${id}`, data);
  },
  deleteRoom: async (id) => {
    return await api.delete(`/partner/rooms/${id}`);
  },
  getDepartments: async () => {
    return await api.get('/partner/departments');
  },
};

export default partnerRoomService;
