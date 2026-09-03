import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  History, 
  RefreshCw, 
  AlertCircle, 
  Calendar, 
  User, 
  Stethoscope, 
  Building2, 
  CheckCircle2, 
  XCircle, 
  CreditCard, 
  ShieldCheck,
  FileText
} from 'lucide-react';
import { partnerAppointmentService } from '../../services/clinic_partner/partnerAppointmentService';

export const AppointmentDetailPage = () => {
  const { id } = useParams();
  const [appointment, setAppointment] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load detail
      const resDetail = await partnerAppointmentService.getAppointmentDetail(id);
      const detailData = resDetail.data || resDetail;
      setAppointment(detailData);

      // Load lifecycle logs (US-24)
      const resLogs = await partnerAppointmentService.getAppointmentLifecycleLogs(id);
      const logData = resLogs.data || resLogs;
      setLogs(Array.isArray(logData) ? logData : []);
    } catch (err) {
      console.error('Failed to load appointment lifecycle logs', err);
      setError(err.message || 'Không thể tải chi tiết lịch hẹn hoặc nhật ký vòng đời.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
  };

  const getEventIcon = (eventType, newStatus) => {
    const status = newStatus || eventType;
    switch (status) {
      case 'CONFIRMED':
      case 'APPOINTMENT_CONFIRMED':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
      case 'CHECKED_IN':
        return <ShieldCheck className="w-5 h-5 text-cyan-600" />;
      case 'PAYMENT_SUCCESS':
      case 'PENDING_PAYMENT':
        return <CreditCard className="w-5 h-5 text-blue-600" />;
      case 'CANCELLED':
      case 'HOLD_EXPIRED':
      case 'PAYMENT_FAILED':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <History className="w-5 h-5 text-amber-600" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-500">
        <RefreshCw className="w-6 h-6 animate-spin mr-3 text-cyan-600" />
        <span>Đang tải thông tin nhật ký vòng đời booking...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button & Title Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div className="flex items-center gap-4">
          <Link
            to="/clinic-partner/appointments"
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 transition shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 text-xs font-mono font-bold rounded-full bg-cyan-100 text-cyan-700 border border-cyan-200">
                US-24 & US-12
              </span>
              <h1 className="text-2xl font-bold text-slate-900">
                Chi tiết Booking #{appointment?.bookingCode || id}
              </h1>
            </div>
            <p className="text-sm text-slate-500 mt-0.5">
              Truy vết nhật ký sự kiện vòng đời đặt khám (Audit Trail Lifecycle Log)
            </p>
          </div>
        </div>

        <button
          onClick={loadData}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:text-slate-900 transition shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Làm mới timeline</span>
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-start gap-3 shadow-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
          <div className="text-sm font-medium">{error}</div>
        </div>
      )}

      {/* Appointment Information Card */}
      {appointment && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <span className="text-xs font-semibold text-slate-500">Mã Đặt khám</span>
              <h2 className="text-xl font-mono font-bold text-cyan-700">
                {appointment.bookingCode || `CS-${appointment.id}`}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-500">Trạng thái hiện tại:</span>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                {appointment.status || 'CONFIRMED'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-cyan-600" /> Bệnh nhân:
              </span>
              <p className="text-sm font-semibold text-slate-900">{appointment.patientName || 'Nguyễn Văn An'}</p>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                <Stethoscope className="w-3.5 h-3.5 text-cyan-600" /> Bác sĩ:
              </span>
              <p className="text-sm font-semibold text-slate-900">{appointment.doctorName || 'PGS.TS Nguyễn Mạnh Hà'}</p>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-cyan-600" /> Thời gian khám:
              </span>
              <p className="text-sm font-mono font-bold text-cyan-700">
                {appointment.appointmentDate} | {appointment.startTime || '08:00'} - {appointment.endTime || '08:30'}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-cyan-600" /> Phòng khám:
              </span>
              <p className="text-sm font-medium text-slate-800">{appointment.clinicName || 'Phòng khám Tôn Thất Tùng'}</p>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-emerald-600" /> Giá khám:
              </span>
              <p className="text-sm font-bold text-slate-900">{formatCurrency(appointment.consultationFee || 500000)}</p>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Tiền cọc (Deposit):
              </span>
              <p className="text-sm font-bold text-emerald-700">{formatCurrency(appointment.depositAmount || 100000)}</p>
            </div>
          </div>

          {appointment.symptomNote && (
            <div className="mt-4 pt-4 border-t border-slate-200 bg-slate-50 rounded-xl p-3 text-xs text-slate-700 flex items-start gap-2">
              <FileText className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-800">Ghi chú triệu chứng từ bệnh nhân:</span>
                <p className="text-slate-600 mt-0.5">{appointment.symptomNote}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Timeline Audit Logs Section (US-24) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-4">
          <History className="w-5 h-5 text-cyan-600" />
          <h2 className="text-lg font-bold text-slate-900">Timeline Nhật ký Vòng đời Booking (US-24)</h2>
        </div>

        {logs.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs font-medium">
            Chưa có ghi nhận nhật ký vòng đời nào cho lịch hẹn này.
          </div>
        ) : (
          <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {logs.map((log, index) => (
              <div key={log.id || index} className="relative flex items-start gap-4">
                {/* Timeline node icon */}
                <div className="absolute -left-[31px] top-0 p-1.5 rounded-full bg-white border border-slate-300 shadow-sm">
                  {getEventIcon(log.eventType, log.newStatus)}
                </div>

                {/* Timeline content box */}
                <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 font-mono">
                        {log.eventType || log.newStatus}
                      </span>
                      {log.previousStatus && (
                        <span className="text-xs text-slate-500 font-mono">
                          ({log.previousStatus} → {log.newStatus})
                        </span>
                      )}
                    </div>

                    <span className="text-xs font-mono font-bold text-cyan-700">
                      {log.createdAt ? new Date(log.createdAt).toLocaleString('vi-VN') : 'N/A'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    {log.note || 'Sự kiện vòng đời được ghi nhận bởi hệ thống CareSlot.'}
                  </p>

                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-2 border-t border-slate-200">
                    <span>Người thực hiện (Actor): <strong className="text-cyan-700">{log.actor || 'SYSTEM'}</strong></span>
                    <span>Event ID: #{log.id}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
