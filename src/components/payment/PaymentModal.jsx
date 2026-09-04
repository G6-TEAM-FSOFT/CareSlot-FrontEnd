import React, { useState, useEffect } from 'react';
import {
  X,
  Clock,
  Building2,
  Calendar,
  User,
  AlertCircle,
  ChevronRight,
  Sparkles,
  Lock
} from 'lucide-react';
import { paymentService } from '../../services/paymentService';

// Helper function to calculate remaining hold time (10 mins = 600s) from appointment creation
const getRemainingHoldSeconds = (apt) => {
  if (!apt) return 600;

  // 1. Check if backend returned createdAt timestamp
  if (apt.createdAt) {
    let createdTime = null;
    if (Array.isArray(apt.createdAt)) {
      const [y, m, d, h, min, s] = apt.createdAt;
      createdTime = new Date(y, m - 1, d, h || 0, min || 0, s || 0).getTime();
    } else {
      createdTime = new Date(apt.createdAt).getTime();
    }

    if (createdTime && !isNaN(createdTime)) {
      const elapsedSeconds = Math.floor((Date.now() - createdTime) / 1000);
      const remaining = 600 - elapsedSeconds;
      return remaining > 0 ? remaining : 0;
    }
  }

  // 2. Fallback: attach a timestamp to appointment instance when first opened
  if (!apt._clientHoldStartTime) {
    apt._clientHoldStartTime = Date.now();
  }
  const elapsedSeconds = Math.floor((Date.now() - apt._clientHoldStartTime) / 1000);
  const remaining = 600 - elapsedSeconds;
  return remaining > 0 ? remaining : 0;
};

export const PaymentModal = ({ isOpen, onClose, appointment, onSuccessRedirect }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(600);

  // Countdown timer effect based on appointment creation time
  useEffect(() => {
    if (!isOpen || !appointment) return;

    const updateTimer = () => {
      const remaining = getRemainingHoldSeconds(appointment);
      setTimeLeft(remaining);
      return remaining;
    };

    const initialRemaining = updateTimer();
    if (initialRemaining <= 0) return;

    const timer = setInterval(() => {
      const remaining = updateTimer();
      if (remaining <= 0) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, appointment]);

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
            <span className={`font-mono font-bold text-sm px-2.5 py-0.5 rounded-lg ${timeLeft < 180 ? 'bg-rose-500/30 text-rose-200 border border-rose-400/30' : 'bg-white/10 text-amber-300'
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

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}
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
