import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  Clock,
  CreditCard,
  QrCode,
  Building2,
  Calendar,
  User,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Lock
} from 'lucide-react';
import { paymentService } from '../../services/paymentService';

export const PaymentModal = ({ isOpen, onClose, appointment, onSuccessRedirect }) => {
  const [selectedMethod, setSelectedMethod] = useState('vnpay_qr'); // 'vnpay_qr' | 'atm' | 'intl'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(600); // 10 mins countdown

  // Countdown timer effect
  useEffect(() => {
    if (!isOpen) return;

    setTimeLeft(600);
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen || !appointment) return null;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const depositAmount = appointment.depositAmount || 100000;
  const consultationFee = appointment.consultationFee || 350000;
  const remainingFee = consultationFee - depositAmount;

  const handlePayWithVNPay = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await paymentService.createPaymentUrl(appointment.id);
      const paymentUrl = typeof res === 'string' ? res : (res?.data || res);

      if (typeof paymentUrl === 'string' && paymentUrl.startsWith('http')) {
        // Direct redirect to VNPay Sandbox Payment Gateway
        window.location.href = paymentUrl;
      } else {
        setError('Không nhận được liên kết thanh toán từ cổng VNPay. Vui lòng thử lại.');
        setLoading(false);
      }
    } catch (err) {
      console.error('Payment URL error:', err);
      setError(err?.message || 'Có lỗi xảy ra khi tạo giao dịch thanh toán VNPay. Vui lòng thử lại.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-900 via-sky-800 to-indigo-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-2xl p-2 flex items-center justify-center shadow-lg shrink-0">
              <img
                src="https://sandbox.vnpayment.vn/paymentv2/images/brands/logo.svg"
                alt="VNPay Logo"
                className="w-full h-auto object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = '<span class="text-sky-700 font-extrabold text-xs">VNPAY</span>';
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">Thanh toán Tiền cọc Giữ chỗ</h2>
                <span className="bg-amber-400 text-slate-900 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  VNPay Sandbox
                </span>
              </div>
              <p className="text-xs text-sky-200 mt-0.5">
                Mã booking: <span className="font-mono font-bold text-white">{appointment.bookingCode || 'CS' + appointment.id}</span>
              </p>
            </div>
          </div>

          {/* Countdown timer badge */}
          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-sky-200">
              <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>Thời gian giữ ca khám:</span>
            </div>
            <span className={`font-mono font-bold text-sm px-2.5 py-0.5 rounded-lg ${
              timeLeft < 180 ? 'bg-rose-500/30 text-rose-200 border border-rose-400/30' : 'bg-white/10 text-amber-300'
            }`}>
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Appointment Summary Box */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-sky-600" />
              Thông tin lịch khám
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-start gap-2">
                <User className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block text-[11px]">Bệnh nhân</span>
                  <span className="font-bold text-slate-800">{appointment.patientName || 'Bệnh nhân'}</span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Building2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block text-[11px]">Bác sĩ & Chuyên khoa</span>
                  <span className="font-bold text-slate-800">{appointment.doctorName || 'Bác sĩ chuyên khoa'}</span>
                  <p className="text-[11px] text-slate-500">{appointment.specialtyName || ''}</p>
                </div>
              </div>

              <div className="flex items-start gap-2 sm:col-span-2">
                <Calendar className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block text-[11px]">Thời gian & Phòng khám</span>
                  <span className="font-bold text-sky-900">
                    {appointment.startTime ? appointment.startTime.substring(0, 5) : ''} - {appointment.endTime ? appointment.endTime.substring(0, 5) : ''} ({appointment.appointmentDate})
                  </span>
                  <p className="text-[11px] text-slate-600">{appointment.clinicName} {appointment.roomName ? `(${appointment.roomName})` : ''}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Breakdown Card */}
          <div className="bg-gradient-to-br from-sky-50 to-blue-50/50 border border-sky-200/80 rounded-2xl p-4 space-y-2">
            <div className="flex justify-between items-center text-xs text-slate-600">
              <span>Giá dịch vụ khám niêm yết:</span>
              <span className="font-semibold text-slate-800">{Number(consultationFee).toLocaleString()} đ</span>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-600">
              <span>Số tiền thanh toán còn lại tại PK:</span>
              <span className="font-semibold text-slate-700">{Number(remainingFee).toLocaleString()} đ</span>
            </div>
            <div className="pt-2 border-t border-sky-200/60 flex justify-between items-center">
              <div>
                <span className="text-xs font-bold text-sky-900 block">Số tiền thanh toán cọc ngay:</span>
                <span className="text-[11px] text-sky-600 font-medium">Bảo lưu giữ slot khám trong 10 phút</span>
              </div>
              <span className="text-xl font-extrabold text-sky-700">
                {Number(depositAmount).toLocaleString()} <span className="text-sm">đ</span>
              </span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block">
              Chọn phương thức thanh toán VNPay:
            </label>

            <div className="grid grid-cols-1 gap-2.5">
              {/* Option 1: VNPay QR */}
              <button
                type="button"
                onClick={() => setSelectedMethod('vnpay_qr')}
                className={`p-3.5 rounded-2xl border flex items-center justify-between text-left transition ${
                  selectedMethod === 'vnpay_qr'
                    ? 'border-sky-500 bg-sky-50/80 ring-2 ring-sky-400/40 shadow-sm'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center text-sky-700 shrink-0">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Ứng dụng Ngân hàng / VNPAY QR</h4>
                    <p className="text-[11px] text-slate-500">Quét mã QR bằng ứng dụng ngân hàng (Vietcombank, BIDV, Agribank...)</p>
                  </div>
                </div>
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                  selectedMethod === 'vnpay_qr' ? 'border-sky-600 bg-sky-600' : 'border-slate-300'
                }`}>
                  {selectedMethod === 'vnpay_qr' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                </div>
              </button>

              {/* Option 2: Domestic ATM */}
              <button
                type="button"
                onClick={() => setSelectedMethod('atm')}
                className={`p-3.5 rounded-2xl border flex items-center justify-between text-left transition ${
                  selectedMethod === 'atm'
                    ? 'border-sky-500 bg-sky-50/80 ring-2 ring-sky-400/40 shadow-sm'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Thẻ ATM / Tài khoản nội địa</h4>
                    <p className="text-[11px] text-slate-500">Thanh toán qua 40+ ngân hàng nội địa Việt Nam</p>
                  </div>
                </div>
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                  selectedMethod === 'atm' ? 'border-sky-600 bg-sky-600' : 'border-slate-300'
                }`}>
                  {selectedMethod === 'atm' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                </div>
              </button>

              {/* Option 3: International Cards */}
              <button
                type="button"
                onClick={() => setSelectedMethod('intl')}
                className={`p-3.5 rounded-2xl border flex items-center justify-between text-left transition ${
                  selectedMethod === 'intl'
                    ? 'border-sky-500 bg-sky-50/80 ring-2 ring-sky-400/40 shadow-sm'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Thẻ quốc tế (Visa, Mastercard, JCB)</h4>
                    <p className="text-[11px] text-slate-500">Chấp nhận thanh toán bằng thẻ tín dụng / ghi nợ quốc tế</p>
                  </div>
                </div>
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                  selectedMethod === 'intl' ? 'border-sky-600 bg-sky-600' : 'border-slate-300'
                }`}>
                  {selectedMethod === 'intl' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                </div>
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Security Banner */}
          <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1">
            <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Giao dịch được bảo mật bởi chuẩn hóa mã hóa 256-bit SSL của VNPay.</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-3 rounded-2xl text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 transition"
          >
            Thanh toán sau
          </button>

          <button
            type="button"
            disabled={loading || timeLeft === 0}
            onClick={handlePayWithVNPay}
            className="flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-sky-500/25 transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Đang kết nối cổng VNPay...</span>
              </>
            ) : (
              <>
                <span>Thanh toán {Number(depositAmount).toLocaleString()} đ qua VNPay</span>
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
