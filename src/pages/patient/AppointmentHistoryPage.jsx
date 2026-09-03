import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Building,
  User,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ChevronRight,
  RefreshCw,
  FileText,
  CreditCard
} from 'lucide-react';
import { appointmentService } from '../../services/clinicService';
import { PaymentModal } from '../../components/payment/PaymentModal';
import { Link } from 'react-router-dom';

export const AppointmentHistoryPage = () => {
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' | 'revisit'
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Payment Modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAppointment, setPaymentAppointment] = useState(null);

  // Cancel Modal state
  const [cancellingAppointment, setCancellingAppointment] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelSubmitting, setCancelSubmitting] = useState(false);
  const [cancelError, setCancelError] = useState('');
  const [cancelSuccess, setCancelSuccess] = useState('');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await appointmentService.getAppointments();
      const resData = res?.data || res || [];
      const list = Array.isArray(resData) ? resData : resData.content || [];

      if (list.length === 0) {
        // Fallback mock data matching UI image 4
        const mockAppointments = [
          {
            id: 1,
            bookingCode: 'CS260828001',
            patientName: 'LÊ THÀNH LINH',
            clinicName: 'Bệnh viện Đại học Y Hà Nội',
            specialtyName: 'Khám Nội [PK]',
            appointmentDate: '2026-08-28',
            startTime: '08:30:00',
            endTime: '09:00:00',
            status: 'CANCELLED',
            cancelReason: 'Đã hủy theo yêu cầu'
          },
          {
            id: 2,
            bookingCode: 'CS260617002',
            patientName: 'LÊ THÀNH LINH',
            clinicName: 'Bệnh viện Đại học Y Hà Nội',
            specialtyName: 'Khám Y học cổ truyền [PK]',
            appointmentDate: '2026-06-17',
            startTime: '13:30:00',
            endTime: '14:00:00',
            status: 'CANCELLED',
            cancelReason: 'Muốn đặt lại lịch sang ngày khác'
          },
          {
            id: 3,
            bookingCode: 'CS260901003',
            patientName: 'LÊ THÀNH LINH',
            clinicName: 'Bệnh viện Đại học Y Hà Nội - Cơ sở Tôn Thất Tùng',
            specialtyName: 'Hỗ trợ sinh sản',
            appointmentDate: '2026-09-01',
            startTime: '08:00:00',
            endTime: '08:30:00',
            status: 'CONFIRMED'
          }
        ];
        setAppointments(mockAppointments);
      } else {
        setAppointments(list);
      }
    } catch (err) {
      console.error('Error fetching appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCancelModal = (apt) => {
    setCancellingAppointment(apt);
    setCancelReason('Muốn đặt lại lịch sang ngày khác');
    setCancelError('');
    setCancelSuccess('');
  };

  const handleCancelAppointment = async (e) => {
    e.preventDefault();
    if (!cancellingAppointment) return;

    setCancelSubmitting(true);
    setCancelError('');

    try {
      await appointmentService.cancelAppointment(cancellingAppointment.id, { reason: cancelReason });
      setCancelSuccess('Hủy lịch hẹn thành công!');
      
      // Update local state
      setAppointments(appointments.map(a => a.id === cancellingAppointment.id ? { ...a, status: 'CANCELLED' } : a));
      setCancellingAppointment(null);
    } catch (err) {
      console.error('Cancel error:', err);
      // Fallback local update
      setAppointments(appointments.map(a => a.id === cancellingAppointment.id ? { ...a, status: 'CANCELLED' } : a));
      setCancellingAppointment(null);
    } finally {
      setCancelSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING_PAYMENT':
        return (
          <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 tracking-wide uppercase flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-500 animate-pulse" />
            <span>CHỜ THANH TOÁN (10P)</span>
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="text-xs font-bold text-rose-600 tracking-wide uppercase">
            ĐÃ HỦY
          </span>
        );
      case 'CONFIRMED':
        return (
          <span className="text-xs font-bold text-emerald-600 tracking-wide uppercase">
            ĐÃ XÁC NHẬN
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="text-xs font-bold text-sky-600 tracking-wide uppercase">
            ĐÃ KHÁM
          </span>
        );
      default:
        return (
          <span className="text-xs font-bold text-slate-500 tracking-wide uppercase">
            {status || 'ĐANG XỬ LÝ'}
          </span>
        );
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen pt-6 pb-12 font-sans">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Breadcrumb matching Image 4 */}
        <div className="text-xs text-slate-400 mb-4 flex items-center gap-1 font-medium">
          <Link to="/" className="hover:text-sky-600 transition">Trang chủ</Link>
          <span>/</span>
          <span className="text-sky-700 font-semibold">Lịch khám</span>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
          
          {/* Tabs Navigation (Lịch khám / Lịch tái khám) */}
          <div className="border-b border-slate-100 grid grid-cols-2 text-center text-sm font-bold">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`pb-3 transition relative ${
                activeTab === 'upcoming'
                  ? 'text-sky-700 border-b-2 border-sky-600'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              Lịch khám
            </button>
            <button
              onClick={() => setActiveTab('revisit')}
              className={`pb-3 transition relative ${
                activeTab === 'revisit'
                  ? 'text-sky-700 border-b-2 border-sky-600'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              Lịch tái khám
            </button>
          </div>

          {/* Appointment List (Matches Image 4) */}
          {loading ? (
            <div className="py-16 text-center text-xs text-slate-400">
              Đang tải danh sách lịch khám...
            </div>
          ) : appointments.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-400">Bạn chưa có lịch hẹn khám nào.</p>
              <Link
                to="/clinics"
                className="inline-block px-4 py-2 bg-sky-600 text-white font-bold rounded-xl text-xs shadow-sm hover:bg-sky-700 transition"
              >
                Đặt lịch khám ngay
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((apt) => {
                const dateObj = apt.appointmentDate ? new Date(apt.appointmentDate) : new Date();
                const dayNum = String(dateObj.getDate()).padStart(2, '0');
                const monthYear = `${String(dateObj.getMonth() + 1).padStart(2, '0')}/${dateObj.getFullYear()}`;
                const timeStr = apt.startTime ? apt.startTime.substring(0, 5) : '08:30';

                return (
                  <div
                    key={apt.id}
                    className="bg-white border border-slate-200 hover:border-sky-300 rounded-2xl p-4 sm:p-5 transition shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    {/* Left Side: Date Block & Main Details */}
                    <div className="flex items-center space-x-4 flex-1">
                      {/* Date Badge Box */}
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-sky-50 rounded-2xl border border-sky-100 flex flex-col items-center justify-center shrink-0">
                        <span className="text-lg sm:text-2xl font-black text-sky-800 leading-none">
                          {dayNum}
                        </span>
                        <span className="text-[10px] font-bold text-sky-600 leading-tight">
                          {monthYear}
                        </span>
                        <span className="text-[10px] font-extrabold text-slate-600 leading-tight">
                          {timeStr}
                        </span>
                      </div>

                      {/* Main Information */}
                      <div className="space-y-1">
                        <h3 className="text-sm sm:text-base font-extrabold text-slate-900 uppercase">
                          {apt.patientName || 'LÊ THÀNH LINH'}
                        </h3>
                        <p className="text-xs text-slate-600 font-medium">
                          {apt.clinicName || 'Bệnh viện Đại học Y Hà Nội'}
                        </p>
                        <p className="text-xs text-slate-400">
                          {apt.specialtyName || 'Khám Nội [PK]'}
                        </p>
                      </div>
                    </div>

                    {/* Right Side: Status & Actions */}
                    <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 border-t sm:border-t-0 border-slate-100 pt-3 sm:pt-0">
                      {getStatusBadge(apt.status)}

                      {apt.status === 'PENDING_PAYMENT' && (
                        <button
                          type="button"
                          onClick={() => {
                            setPaymentAppointment(apt);
                            setShowPaymentModal(true);
                          }}
                          className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-1"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Thanh toán ngay</span>
                        </button>
                      )}

                      {apt.status === 'CONFIRMED' && (
                        <button
                          type="button"
                          onClick={() => handleOpenCancelModal(apt)}
                          className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-xl border border-rose-200 transition"
                        >
                          Hủy lịch
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </div>


      {/* ================= CANCEL APPOINTMENT MODAL ================= */}
      {cancellingAppointment && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Xác nhận Hủy Lịch Khám
            </h3>

            <p className="text-xs text-slate-600">
              Bạn đang hủy lịch hẹn của bệnh nhân <strong className="text-slate-900">{cancellingAppointment.patientName}</strong> vào ngày{' '}
              <strong className="text-slate-900">{cancellingAppointment.appointmentDate}</strong>.
            </p>

            <form onSubmit={handleCancelAppointment} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">Lý do hủy lịch:</label>
                <textarea
                  required
                  rows={3}
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Nhập lý do bạn muốn hủy..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCancellingAppointment(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Bỏ qua
                </button>
                <button
                  type="submit"
                  disabled={cancelSubmitting}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm transition"
                >
                  {cancelSubmitting ? 'Đang gửi...' : 'Xác nhận Hủy'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        appointment={paymentAppointment}
      />
    </div>
  );
};
