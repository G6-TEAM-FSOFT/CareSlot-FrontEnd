import api from '../config/axios';

export const paymentService = {
  /**
   * Tạo URL thanh toán VNPay cho đơn đặt hẹn
   * @param {number|string} appointmentId
   * @returns {Promise<any>} Response chứa paymentUrl trong res.data
   */
  createPaymentUrl: async (appointmentId) => {
    return await api.post('/payments/create-url', null, {
      params: { appointmentId }
    });
  },

  /**
   * Xử lý thông số callback từ VNPay sau khi chuyển hướng về Frontend
   * @param {Object} params - Query parameters từ URL
   * @returns {Promise<any>} Response chứa thông tin Appointment được cập nhật
   */
  handleCallback: async (params) => {
    return await api.get('/payments/vnpay-callback', { params });
  }
};
