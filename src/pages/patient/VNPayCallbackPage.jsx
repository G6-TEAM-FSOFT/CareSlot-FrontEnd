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
  PhoneCall
} from 'lucide-react';
import { paymentService } from '../../services/paymentService';

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
              <span className="bg-emerald-500/30 text-emerald-100 border border-emerald-300/30 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Giao dịch thành công
              </span>
              <h1 className="text-2xl font-extrabold mt-2">Thanh Toán Đặt Cọc Thành Công!</h1>
              <p className="text-xs text-emerald-100 mt-1">
                Lịch hẹn khám bệnh của bạn đã được xác nhận chính thức trên hệ thống CareSlot.
              </p>
            </div>

            {/* Content Ticket */}
            <div className="p-6 sm:p-8 space-y-6">

              {/* Booking Code & QR Section */}
              <div className="bg-gradient-to-r from-sky-50 to-blue-50/60 rounded-2xl p-5 border border-sky-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center sm:text-left">
                  <span className="text-xs text-slate-400 font-medium">MÃ XÁC NHẬN ĐẶT KHÁM (BOOKING CODE)</span>
                  <div className="text-2xl font-black font-mono text-sky-900 tracking-wider">
                    {appointment?.bookingCode || paymentData.vnp_TxnRef || 'CS-SUCCESS'}
                  </div>
                  <p className="text-[11px] text-sky-700">
                    Vui lòng cung cấp mã này tại quầy tiếp đón phòng khám khi tới lượt.
                  </p>
                </div>

                {/* QR Code display */}
                <div className="bg-white p-3 rounded-xl border border-sky-200 shadow-sm text-center shrink-0">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${appointment?.bookingCode || paymentData.vnp_TxnRef || 'CareSlot'}`}
                    alt="Booking QR Code"
                    className="w-24 h-24 object-contain mx-auto"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                    }}
                  />
                  <span className="text-[10px] text-slate-400 font-mono block mt-1">Check-in QR</span>
                </div>
              </div>

              {/* Grid 2 Columns Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                {/* Column 1: Appointment Info */}
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/60 space-y-3">
                  <h3 className="font-bold text-sky-900 text-xs border-b border-slate-200 pb-2.5 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-sky-600" />
                    Thông tin Lịch hẹn
                  </h3>

                  <div className="space-y-2.5 text-slate-700">
                    <div className="flex items-start gap-2">
                      <User className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-slate-400 text-[11px] block">Bệnh nhân</span>
                        <span className="font-bold text-slate-900">{appointment?.patientName || 'Bệnh nhân'}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <User className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-slate-400 text-[11px] block">Bác sĩ phụ trách</span>
                        <span className="font-bold text-slate-900">{appointment?.doctorName || 'Bác sĩ chuyên khoa'}</span>
                        <p className="text-slate-500 text-[11px]">{appointment?.specialtyName}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Clock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-slate-400 text-[11px] block">Thời gian khám</span>
                        <span className="font-bold text-sky-800">
                          {appointment?.startTime ? appointment.startTime.substring(0, 5) : ''} - {appointment?.endTime ? appointment.endTime.substring(0, 5) : ''} ({appointment?.appointmentDate})
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Building className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-slate-400 text-[11px] block">Cơ sở & Phòng khám</span>
                        <span className="font-semibold text-slate-800">{appointment?.clinicName || 'Bệnh viện ĐH Y Hà Nội'}</span>
                        <p className="text-slate-500 text-[11px]">{appointment?.roomName || 'Phòng khám chuyên khoa'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Column 2: VNPay Payment Receipt Info */}
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/60 space-y-3">
                  <h3 className="font-bold text-sky-900 text-xs border-b border-slate-200 pb-2.5 flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-sky-600" />
                    Biên lai Thanh toán VNPay
                  </h3>

                  <div className="space-y-2 text-slate-700">
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Số tiền đặt cọc đã trả:</span>
                      <span className="font-bold text-emerald-600 text-sm">
                        {appointment?.depositAmount ? Number(appointment.depositAmount).toLocaleString() : Number(paymentData.vnp_Amount / 100 || 100000).toLocaleString()} đ
                      </span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Mã giao dịch VNPay:</span>
                      <span className="font-mono font-semibold text-slate-800">{paymentData.vnp_TransactionNo || 'VN' + Date.now()}</span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Mã tham chiếu (TxnRef):</span>
                      <span className="font-mono font-semibold text-slate-800">{paymentData.vnp_TxnRef || 'N/A'}</span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Ngân hàng thanh toán:</span>
                      <span className="font-bold text-sky-700">{paymentData.vnp_BankCode || 'NCB'}</span>
                    </div>

                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Trạng thái đặt cọc:</span>
                      <span className="font-bold text-emerald-600">ĐÃ THANH TOÁN (PAID)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Instructions notice */}
              <div className="p-4 bg-sky-50 border border-sky-200 rounded-2xl text-xs text-sky-900 space-y-1">
                <h4 className="font-bold flex items-center gap-1.5 text-sky-900">
                  <Sparkles className="w-4 h-4 text-sky-600" />
                  Hướng dẫn khi tới khám:
                </h4>
                <ul className="list-disc list-inside space-y-1 text-sky-800 text-[11.5px]">
                  <li>Vui lòng có mặt tại phòng khám trước giờ hẹn 15 phút.</li>
                  <li>Mang theo giấy tờ tùy thân (CCCD/BHYT nếu có) và mã Booking Code trên.</li>
                  <li>Số tiền còn lại (nếu có) sẽ được thanh toán trực tiếp tại quầy thu ngân phòng khám.</li>
                </ul>
              </div>

              {/* Footer Actions (Hidden when printing) */}
              <div className="print:hidden pt-4 flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={() => navigate('/history')}
                  className="w-full sm:w-1/2 py-3 px-4 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl transition shadow-md flex items-center justify-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  <span>Quản lý lịch khám của tôi</span>
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
