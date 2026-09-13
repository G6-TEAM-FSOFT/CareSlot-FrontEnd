import React, { useState, useEffect } from 'react';
import {
  Shuffle,
  X,
  Stethoscope,
  MapPin,
  Clock,
  Calendar,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  User,
  Building2
} from 'lucide-react';
import { partnerAppointmentService } from '../../services/clinic_partner/partnerAppointmentService';

export default function ReassignDoctorModal({
  show,
  appointment,
  onClose,
  onSuccess
}) {
  const [replacementSlots, setReplacementSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState('');
  const [selectedSlotId, setSelectedSlotId] = useState(null);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const fetchReplacementSlots = async () => {
    if (!appointment?.id) return;
    setLoadingSlots(true);
    setSlotsError('');
    try {
      const res = await partnerAppointmentService.getReplacementSlots(appointment.id);
      const slots = res?.data || (Array.isArray(res) ? res : []);
      setReplacementSlots(slots);
      if (slots.length > 0) {
        setSelectedSlotId((prev) => prev || slots[0].id);
      } else {
        setSelectedSlotId(null);
      }
    } catch (err) {
      console.error('Lỗi tải danh sách slot thay thế:', err);
      setSlotsError(err?.message || err?.response?.data?.message || 'Không thể tải danh sách slot thay thế.');
    } finally {
      setLoadingSlots(false);
    }
  };

  useEffect(() => {
    if (show && appointment) {
      setSelectedSlotId(null);
      setReason('');
      setSlotsError('');
      setSubmitError('');
      fetchReplacementSlots();
    }
  }, [show, appointment]);

  if (!show || !appointment) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSlotId) {
      setSubmitError('Vui lòng chọn một Bác sĩ / Phòng khám thay thế từ danh sách.');
      return;
    }

    setSubmitting(true);
    setSubmitError('');
    try {
      await partnerAppointmentService.reassignDoctor(appointment.id, {
        replacementSlotId: selectedSlotId,
        reason: reason.trim() || undefined
      });
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (err) {
      console.error('Lỗi điều phối bác sĩ:', err);
      setSubmitError(err?.message || err?.response?.data?.message || 'Điều phối bác sĩ thất bại. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-700 via-purple-700 to-indigo-800 text-white p-5 md:p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-purple-200 border border-white/20 font-bold shadow-inner">
              <Shuffle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg md:text-xl text-white flex items-center gap-2">
                Điều Phối Lại Bác Sĩ & Phòng Khám
              </h3>
              <p className="text-xs text-indigo-100 mt-0.5">
                Lịch hẹn #{appointment.id} • Mã Booking: <strong className="font-mono text-purple-200">{appointment.bookingCode || `CS-${appointment.id}`}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 md:p-6 space-y-5 overflow-y-auto flex-1">

          {/* Current Doctor & Slot Info Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Thông tin phân công hiện tại:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-700">
                <User className="w-4 h-4 text-cyan-600 shrink-0" />
                <span>Bệnh nhân: <strong className="text-slate-900">{appointment.patientName || 'N/A'}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <Stethoscope className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Bác sĩ hiện tại: <strong className="text-slate-900">{appointment.doctorName || 'N/A'}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <Calendar className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Ngày khám: <strong className="font-mono text-slate-900">{appointment.appointmentDate || 'N/A'}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Khung giờ: <strong className="font-mono text-slate-900">{appointment.startTime ? `${appointment.startTime} - ${appointment.endTime || ''}` : 'N/A'}</strong></span>
              </div>
            </div>
          </div>

          {/* Replacement Slot Selector */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                <Stethoscope className="w-4 h-4 text-indigo-600" />
                Chọn Bác sĩ / Phòng khám thay thế: <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={fetchReplacementSlots}
                disabled={loadingSlots}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingSlots ? 'animate-spin' : ''}`} />
                <span>Làm mới danh sách</span>
              </button>
            </div>

            {loadingSlots ? (
              <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl text-center text-slate-500 flex items-center justify-center gap-2 text-xs">
                <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
                <span>Đang tìm kiếm các Bác sĩ cùng chuyên khoa còn trống trong khung giờ...</span>
              </div>
            ) : slotsError ? (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs flex items-center justify-between gap-2">
                <span>{slotsError}</span>
                <button
                  type="button"
                  onClick={fetchReplacementSlots}
                  className="px-2.5 py-1 bg-rose-600 text-white rounded-lg text-xs font-bold"
                >
                  Thử lại
                </button>
              </div>
            ) : replacementSlots.length === 0 ? (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 text-xs flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-sm">Không tìm thấy Bác sĩ nào khác còn trống!</p>
                  <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                    Không có bác sĩ nào khác cùng chuyên khoa còn slot trống trong khung giờ{' '}
                    <strong className="font-mono">({appointment.startTime ? appointment.startTime.substring(0, 5) : ''} - {appointment.endTime ? appointment.endTime.substring(0, 5) : ''})</strong>{' '}
                    ngày <strong className="font-mono">{appointment.appointmentDate}</strong>.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3 max-h-56 overflow-y-auto pr-1">
                {replacementSlots.map((slot) => {
                  const isSelected = selectedSlotId === slot.id;
                  return (
                    <div
                      key={slot.id}
                      onClick={() => setSelectedSlotId(slot.id)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                        isSelected
                          ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-200 shadow-sm'
                          : 'bg-white border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="reassignSlot"
                        checked={isSelected}
                        onChange={() => setSelectedSlotId(slot.id)}
                        className="mt-1 text-indigo-600 focus:ring-indigo-500"
                      />
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="font-extrabold text-slate-900 text-xs flex items-center justify-between">
                          <span className="truncate">{slot.doctorName || 'Bác sĩ thay thế'}</span>
                          <span className="text-[10px] font-mono font-bold text-indigo-700 bg-indigo-100 px-1.5 py-0.5 rounded">
                            Slot #{slot.id}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-600 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="font-medium truncate">{slot.roomName || `Phòng ${slot.roomNumber || ''}`}</span>
                        </div>
                        <div className="text-[11px] font-mono font-bold text-cyan-800">
                          {slot.startTime ? slot.startTime.substring(0, 5) : ''} - {slot.endTime ? slot.endTime.substring(0, 5) : ''}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Reassign Reason */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 block flex items-center gap-1">
              Lý do điều phối lại Bác sĩ: <span className="text-slate-400 font-normal text-[11px]">(tùy chọn)</span>
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ví dụ: Bác sĩ Minh bận ca phẫu thuật khẩn cấp..."
              maxLength={500}
              className="w-full bg-white border border-slate-300 focus:border-indigo-500 rounded-xl p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-100 outline-none transition"
            />
            <p className="text-[11px] text-slate-500 italic">
              * Hệ thống sẽ chuyển slot của Bác sĩ mới sang trạng thái ĐÃ ĐẶT, giải phóng/xử lý slot cũ và lưu vào nhật ký vòng đời (Audit Trail).
            </p>
          </div>

          {/* Submit Error */}
          {submitError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          {/* Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 text-xs rounded-xl transition cursor-pointer"
            >
              Hủy / Đóng
            </button>
            <button
              type="submit"
              disabled={submitting || !selectedSlotId}
              className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-extrabold text-xs rounded-xl shadow-md transition disabled:opacity-50 flex items-center gap-2 cursor-pointer active:scale-95"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang xử lý điều phối...</span>
                </>
              ) : (
                <>
                  <Shuffle className="w-3.5 h-3.5" />
                  <span>Xác nhận Điều Phối Bác Sĩ</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
