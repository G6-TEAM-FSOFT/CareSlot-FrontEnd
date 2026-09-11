import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Printer,
  Calendar,
  Clock,
  MapPin,
  Building,
  User,
  CreditCard,
  FileText,
  Home,
  RefreshCw,
  Sparkles,
  QrCode,
  ShieldCheck,
  PhoneCall,
  Info
} from 'lucide-react';
import { paymentService } from '../../services/paymentService';
import { formatDate, timeLabel } from '../../components/booking/bookingUtils';

export const VNPayCallbackPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [appointment, setAppointment] = useState(null);
  const [paymentData, setPaymentData] = useState({});

  useEffect(() => {
    processCallback();
  }, [location.search]);

  const processCallback = async () => {
    setLoading(true);
    setErrorMsg('');

    // Parse URL search parameters
    const searchParams = new URLSearchParams(location.search);
    const params = {};
    for (const [key, value] of searchParams.entries()) {
      params[key] = value;
    }

    setPaymentData(params);

    if (!params.vnp_ResponseCode) {
      setLoading(false);
      setSuccess(false);
      setErrorMsg('Không tìm thấy thông tin phản hồi từ cổng thanh toán VNPay.');
      return;
    }

    try {
      // Call Backend to verify signature & update appointment status
      const res = await paymentService.handleCallback(params);
      const appointmentData = res?.data?.id ? res.data : (res?.id ? res : (res?.data || res));
      setAppointment(appointmentData);

      if (params.vnp_ResponseCode === '00' || appointmentData?.status === 'CONFIRMED') {
        setSuccess(true);
      } else {
        setSuccess(false);
        setErrorMsg(getVNPayErrorMessage(params.vnp_ResponseCode));
      }
    } catch (err) {
      console.error('VNPay callback error:', err);
      setSuccess(false);
      setErrorMsg(err?.message || getVNPayErrorMessage(params.vnp_ResponseCode) || 'Xác thực thanh toán thất bại.');
    } finally {
      setLoading(false);
    }
  };

  const getVNPayErrorMessage = (code) => {
    switch (code) {
      case '24':
        return 'Giao dịch không thành công do: Khách hàng hủy giao dịch.';
      case '11':
        return 'Giao dịch không thành công do: Đã hết thời gian chờ thanh toán.';
      case '12':
        return 'Giao dịch không thành công do: Thẻ/Tài khoản bị khóa.';
      case '51':
        return 'Giao dịch không thành công do: Tài khoản không đủ số dư.';
      case '65':
        return 'Giao dịch không thành công do: Vượt quá hạn mức giao dịch trong ngày.';
      case '75':
        return 'Ngân hàng thanh toán đang bảo trì. Vui lòng chọn phương thức khác.';
      case '79':
        return 'Nhập sai mật khẩu xác thực thanh toán quá số lần quy định.';
      case '99':
        return 'Lỗi không xác định hoặc Chữ ký dữ liệu không hợp lệ.';
      default:
        return 'Thanh toán thất bại hoặc đã bị hủy bỏ.';
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 bg-slate-50">
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 max-w-md w-full text-center space-y-4">
          <div className="w-16 h-16 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <h2 className="text-lg font-bold text-slate-800">Đang xác thực kết quả thanh toán...</h2>
          <p className="text-xs text-slate-500">
            Vui lòng giữ nguyên màn hình. Hệ thống đang xác minh chữ ký bảo mật từ VNPay.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Print styling helper header */}
        <div className="print:hidden flex items-center justify-between bg-white px-6 py-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center space-x-2 text-sky-900 font-bold">
            <ShieldCheck className="w-5 h-5 text-sky-600" />
            <span>KẾT QUẢ GIAO DỊCH VNPAY</span>
          </div>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>In hóa đơn</span>
          </button>
        </div>

        {/* Main Status Container */}
        {success ? (
          /* ================= SUCCESS STATE ================= */
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden print:shadow-none print:border-none">
            {/* Header Success Banner */}
            <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white p-8 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none" />

              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto text-emerald-600 shadow-lg mb-4 transform hover:scale-105 transition">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <h1 className="text-2xl font-extrabold mt-2">Đặt lịch thành công!</h1>
              <p className="text-xs text-emerald-100 mt-1">
                Đã thanh toán tiền đặt cọc 100.000đ
              </p>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                <span className="bg-emerald-500/30 text-emerald-100 border border-emerald-300/30 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Lịch hẹn đã xác nhận
                </span>
                {appointment?.bookingCode && (
                  <span className="bg-white/20 text-white border border-white/30 text-xs font-mono font-bold px-3 py-1 rounded-full">
                    Mã đặt lịch: {appointment.bookingCode}
                  </span>
                )}
              </div>
            </div>

            {/* Content Ticket */}
            <div className="p-6 sm:p-8 space-y-6">

              {/* Grid 2 Columns Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                {/* Column 1: Appointment Info */}
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/60 space-y-3">
                  <h3 className="font-bold text-slate-900 text-xs border-b border-slate-200 pb-2.5 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-indigo-600" />
                    Thông tin lịch khám
                  </h3>

                  <div className="space-y-2.5 text-slate-700">
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Người khám:</span>
                      <span className="font-bold text-slate-900">{appointment?.patientName || 'Bệnh nhân'}</span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Chuyên khoa:</span>
                      <span className="font-bold text-slate-900">{appointment?.specialtyName || 'Chuyên khoa'}</span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Ngày khám:</span>
                      <span className="font-bold text-slate-900">{formatDate(appointment?.appointmentDate) || paymentData.appointmentDate || 'N/A'}</span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Khung giờ:</span>
                      <span className="font-bold text-indigo-700">
                        {appointment?.startTime ? timeLabel(appointment.startTime) : ''}
                        {appointment?.endTime ? ` - ${timeLabel(appointment.endTime)}` : ''}
                      </span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Cơ sở:</span>
                      <span className="font-semibold text-slate-900 text-right">{appointment?.clinicName || 'Cơ sở y tế'}</span>
                    </div>

                    {appointment?.clinicAddress && (
                      <div className="flex justify-between py-1">
                        <span className="text-slate-500">Địa chỉ:</span>
                        <span className="text-slate-700 text-right max-w-[200px]">{appointment.clinicAddress}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Column 2: VNPay Payment Receipt Info */}
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/60 space-y-3">
                  <h3 className="font-bold text-slate-900 text-xs border-b border-slate-200 pb-2.5 flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-indigo-600" />
                    Thông tin thanh toán
                  </h3>

                  <div className="space-y-2 text-slate-700">
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Tiền cọc đã thanh toán:</span>
                      <span className="font-bold text-emerald-600 text-sm">
                        {appointment?.depositAmount ? Number(appointment.depositAmount).toLocaleString() : Number((paymentData.vnp_Amount || 10000000) / 100).toLocaleString()} đ
                      </span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Trạng thái:</span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">
                        Thành công
                      </span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Mã giao dịch:</span>
                      <span className="font-mono font-semibold text-slate-800">{paymentData.vnp_TransactionNo || paymentData.vnp_TxnRef || 'GD-001234'}</span>
                    </div>

                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Thời gian:</span>
                      <span className="font-semibold text-slate-800">
                        {paymentData.vnp_PayDate ? `${paymentData.vnp_PayDate.substring(6,8)}/${paymentData.vnp_PayDate.substring(4,6)}/${paymentData.vnp_PayDate.substring(0,4)} - ${paymentData.vnp_PayDate.substring(8,10)}:${paymentData.vnp_PayDate.substring(10,12)}` : new Date().toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Instructions notice */}
              <div className="p-4 bg-sky-50 border border-sky-200 rounded-2xl text-xs text-sky-900 flex items-start gap-2.5">
                <Info className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Xuất trình mã đặt lịch tại quầy tiếp đón. <strong>Bác sĩ và phòng khám sẽ được thông báo sau khi hoàn tất check-in.</strong>
                </p>
              </div>

              {/* Footer Actions (Hidden when printing) */}
              <div className="print:hidden pt-4 flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={() => navigate('/history')}
                  className="w-full sm:w-1/2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition shadow-md flex items-center justify-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  <span>Xem lịch khám đã đặt</span>
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="w-full sm:w-1/2 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  <span>Về trang chủ</span>
                </button>
              </div>

            </div>
          </div>
        ) : (
          /* ================= FAILURE / CANCELLED STATE ================= */
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-rose-600 via-amber-600 to-rose-700 text-white p-8 text-center relative">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto text-rose-600 shadow-lg mb-4">
                <XCircle className="w-12 h-12" />
              </div>
              <span className="bg-rose-500/30 text-rose-100 border border-rose-300/30 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Giao dịch chưa hoàn tất
              </span>
              <h1 className="text-2xl font-extrabold mt-2">Thanh Toán Thất Bại Hoặc Đã Hủy</h1>
              <p className="text-xs text-rose-100 mt-1 max-w-md mx-auto">
                {errorMsg}
              </p>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-xs text-slate-700 space-y-3">
                <h3 className="font-bold text-slate-900 text-xs border-b border-slate-200 pb-2">
                  Chi tiết phản hồi từ cổng VNPay:
                </h3>
                <div className="grid grid-cols-2 gap-2 text-[12px]">
                  <div>
                    <span className="text-slate-400 block">Mã lỗi (ResponseCode):</span>
                    <span className="font-mono font-bold text-rose-600">{paymentData.vnp_ResponseCode || 'ERR'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Mã tham chiếu (TxnRef):</span>
                    <span className="font-mono font-semibold text-slate-800">{paymentData.vnp_TxnRef || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-amber-900">Lưu ý về giữ slot khám:</h4>
                  <p className="text-amber-800 text-[11.5px] mt-0.5">
                    Lịch hẹn của bạn sẽ tự động bị hủy nếu không được hoàn tất thanh toán cọc trong vòng 10 phút. Bạn có thể thực hiện thanh toán lại từ trang Danh sách Lịch khám.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={() => navigate('/history')}
                  className="w-full sm:w-1/2 py-3 px-4 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl transition shadow-md flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Thử thanh toán lại</span>
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="w-full sm:w-1/2 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  <span>Về trang chủ</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
