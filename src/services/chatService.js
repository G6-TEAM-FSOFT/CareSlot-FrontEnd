import api from '../config/axios';

export const chatService = {
  /**
   * Tạo session trò chuyện mới với Gemini Chatbot
   * @returns {Promise<{ code: number, message: string, data: { sessionId: string } }>}
   */
  createNewSession: async () => {
    return await api.post('/chat/session/new');
  },

  /**
   * Lấy lời chào tự động cá nhân hóa từ Backend
   * @returns {Promise<{ code: number, message: string, data: string }>}
   */
  getWelcomeMessage: async () => {
    return await api.get('/chat/welcome');
  },

  /**
   * Lấy lịch sử trò chuyện cũ của Session
   * @param {string} sessionId
   * @returns {Promise<{ code: number, message: string, data: Array<{ role: 'user'|'model', parts: Array<{ text: string }> }> }>}
   */
  getHistory: async (sessionId) => {
    return await api.get('/chat/history', {
      params: { sessionId },
    });
  },

  /**
   * Gửi mô tả triệu chứng và nhận tư vấn chuyên khoa
   * @param {string} sessionId
   * @param {string} message
   * @returns {Promise<{ code: number, message: string, data: string }>}
   */
  consult: async (sessionId, message) => {
    return await api.post(`/chat/consult?sessionId=${encodeURIComponent(sessionId)}`, {
      message,
    });
  },
};
