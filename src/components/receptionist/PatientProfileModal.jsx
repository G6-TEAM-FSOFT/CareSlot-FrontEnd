import React, { useState, useEffect } from 'react';
import { UserCheck, User, FileText, CreditCard, X, RefreshCw, Save, Calendar, Clock, Stethoscope, MapPin, Shuffle, AlertTriangle } from 'lucide-react';
import { outpatientService } from '../../services/outpatientService';
import PdfPrintButton from '../PdfPrintButton';

export default function PatientProfileModal({
  show,
  selectedApt,
  listTab,
  patientForm,
  setPatientForm,
  savingProfile,
  loading,
  onClose,
  onSaveProfileOnly,
  onSaveProfileAndCheckIn,
  initialReassignMode = false
}) {
  if (!show || !selectedApt) return null;

  const isConfirmedTab = listTab === 'CONFIRMED' && selectedApt.status !== 'CHECKED_IN' && selectedApt.status !== 'COMPLETED';

  const [isReassigning, setIsReassigning] = useState(initialReassignMode);
  const [replacementSlots, setReplacementSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState('');
  const [selectedReplacementSlotId, setSelectedReplacementSlotId] = useState(null);
  const [reassignReason, setReassignReason] = useState('');
  const [formValidationMsg, setFormValidationMsg] = useState('');

  const fetchReplacementSlots = async () => {
    if (!selectedApt?.id) return;
    setLoadingSlots(true);
    setSlotsError('');
    try {
      const res = await outpatientService.getReplacementSlots(selectedApt.id);
      const slots = res?.data || (Array.isArray(res) ? res : []);
      setReplacementSlots(slots);
      if (slots.length > 0) {
        setSelectedReplacementSlotId((prev) => prev || slots[0].id);
      }
    } catch (err) {
      console.error('Lỗi tải replacement slots:', err);
      setSlotsError(err?.message || err?.response?.data?.message || 'Không thể tải danh sách slot thay thế.');
    } finally {
      setLoadingSlots(false);
    }
  };

  useEffect(() => {
    if (show && selectedApt) {
      setIsReassigning(Boolean(initialReassignMode));
      setSelectedReplacementSlotId(null);
      setReassignReason('');
      setSlotsError('');
      setFormValidationMsg('');
      if (initialReassignMode) {
        fetchReplacementSlots();
      }
    }
  }, [show, selectedApt, initialReassignMode]);

  const handleCheckInSubmit = (e) => {
    if (isReassigning) {
      if (!selectedReplacementSlotId) {
        setFormValidationMsg('Vui lòng chọn một Bác sĩ / Phòng khám thay thế từ danh sách.');
        return;
      }
      setFormValidationMsg('');
      onSaveProfileAndCheckIn(e, {
        replacementSlotId: selectedReplacementSlotId,
        reason: reassignReason.trim() || undefined
      });
    } else {
      setFormValidationMsg('');
      onSaveProfileAndCheckIn(e, {});
    }
  };

  const patientId = selectedApt.patientProfileId || selectedApt.patientProfile?.id;
  const visitId = selectedApt.visitId || selectedApt.visit?.id;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-cyan-700 via-teal-600 to-cyan-800 text-white p-5 md:p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-cyan-200 border border-white/20 font-bold">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg md:text-xl text-white flex items-center gap-2">
                Chi Tiết Hồ Sơ & Lịch Hẹn Bệnh Nhân
              </h3>
              <p className="text-xs text-cyan-100 mt-0.5">
                Lịch hẹn #{selectedApt.id} • Mã Booking: <strong className="font-mono text-cyan-200">{selectedApt.bookingCode || 'BK-N/A'}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content / Form */}
        <form onSubmit={onSaveProfileOnly} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {/* Section 0: Comprehensive Appointment Details Card */}
          <div className="bg-gradient-to-br from-cyan-50/80 via-white to-teal-50/80 border border-cyan-200 rounded-2xl p-4 space-y-3 shadow-sm">
            <div className="flex items-center justify-between border-b border-cyan-200/60 pb-2">
              <h4 className="font-extrabold text-cyan-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-cyan-600" />
                Thông Tin Chi Tiết Lịch Hẹn (Appointment Details)
              </h4>
              <div className="flex items-center gap-2">
                {patientId && visitId && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <PdfPrintButton
                      patientId={patientId}
                      visitId={visitId}
                      type="examination"
                      label="In Phiếu Khám"
                      variant="indigo"
                      size="sm"
                    />
                    <PdfPrintButton
                      patientId={patientId}
                      visitId={visitId}
                      type="prescription"
                      label="In Đơn Thuốc"
                      variant="emerald"
                      size="sm"
                    />
                    <PdfPrintButton
                      patientId={patientId}
                      visitId={visitId}
                      type="summary"
                      label="Tổng Hợp Lượt Khám"
                      variant="secondary"
                      size="sm"
                    />
                  </div>
                )}
                <span className="px-2.5 py-0.5 rounded-md bg-cyan-100 text-cyan-900 border border-cyan-300 font-mono font-bold text-[11px]">
                  #{selectedApt.id} • Mã Booking: {selectedApt.bookingCode || 'BK-N/A'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Bác sĩ chỉ định:</span>
                <span className="font-extrabold text-emerald-700 flex items-center gap-1">
                  <Stethoscope className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  {selectedApt.doctorName || selectedApt.slot?.doctor?.fullName || 'BS. Chuyên Khoa'}
                </span>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Phòng khám / Chuyên khoa:</span>
                <span className="font-bold text-slate-800 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                  {selectedApt.roomName ? `${selectedApt.roomName}${selectedApt.specialtyName ? ` (${selectedApt.specialtyName})` : ''}` : (selectedApt.specialtyName || 'Phòng khám Ngoại Trú')}
                </span>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Ngày & Giờ khám:</span>
                <span className="font-mono font-extrabold text-cyan-800 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-cyan-600 flex-shrink-0" />
                  {selectedApt.appointmentDate || 'Hôm nay'} ({selectedApt.startTime ? `${selectedApt.startTime.substring(0,5)}${selectedApt.endTime ? ` - ${selectedApt.endTime.substring(0,5)}` : ''}` : 'Giờ hẹn linh hoạt'})
                </span>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Trạng thái Lịch hẹn:</span>
                <span className="inline-block mt-0.5 px-2 py-0.5 rounded font-extrabold text-[10px] bg-amber-100 text-amber-800 border border-amber-300">
                  {selectedApt.status || 'CONFIRMED'}
                </span>
              </div>
            </div>

            {/* Fee & Symptom information */}
            <div className="pt-2 border-t border-cyan-200/50 grid sm:grid-cols-2 gap-3 text-xs">
              {selectedApt.consultationFee != null && (
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Phí khám tư vấn:</span>
                  <span className="font-mono font-black text-emerald-700">
                    {Number(selectedApt.consultationFee).toLocaleString('vi-VN')} VNĐ
                    {selectedApt.depositAmount > 0 && <span className="text-slate-500 font-normal ml-1">(Đã cọc: {Number(selectedApt.depositAmount).toLocaleString('vi-VN')} VNĐ)</span>}
                  </span>
                </div>
              )}

              {selectedApt.symptomNote && (
                <div className={selectedApt.consultationFee != null ? "" : "col-span-2"}>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Lý do khám / Ghi chú triệu chứng:</span>
                  <p className="text-slate-800 font-medium italic bg-white p-2 rounded-xl border border-cyan-100 mt-0.5">
                    "{selectedApt.symptomNote}"
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Section 0.5: Reassignment Panel (Only visible for CONFIRMED appointments) */}
          {isConfirmedTab && (
            <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 space-y-3 transition-all">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200/80 pb-2.5">
                <div className="flex items-center gap-2">
                  <Shuffle className="w-4 h-4 text-amber-600" />
                  <h4 className="font-extrabold text-amber-950 text-xs uppercase tracking-wider">
                    Điều Phối Lại Bác Sĩ & Phòng Khám (Reassignment)
                  </h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200/70 text-amber-900">
                    Linh hoạt tại quầy
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const next = !isReassigning;
                    setIsReassigning(next);
                    if (next && replacementSlots.length === 0) {
                      fetchReplacementSlots();
                    }
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 border shadow-sm ${
                    isReassigning
                      ? 'bg-amber-600 border-amber-600 text-white shadow-amber-200'
                      : 'bg-white border-amber-300 text-amber-800 hover:bg-amber-100/60'
                  }`}
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  <span>{isReassigning ? 'Đang bật đổi Bác sĩ (Bấm để hủy)' : 'Đổi Bác sĩ / Phòng khác'}</span>
                </button>
              </div>

              {!isReassigning ? (
                <p className="text-[11.5px] text-amber-800 leading-relaxed">
                  Bác sĩ hiện tại: <strong className="text-emerald-800">{selectedApt.doctorName || selectedApt.slot?.doctor?.fullName || 'BS. Chuyên Khoa'}</strong>
                  {selectedApt.roomName ? <> tại <strong className="text-slate-800">{selectedApt.roomName}</strong></> : ''}
                  {selectedApt.specialtyName ? <> (Khoa {selectedApt.specialtyName})</> : ''}. 
                  Nếu bác sĩ gặp sự cố (ca mổ khẩn, vắng mặt đột xuất), bấm nút <strong className="text-amber-900">"Đổi Bác sĩ / Phòng khác"</strong> phía trên để chọn Bác sĩ thay thế trong cùng khung giờ.
                </p>
              ) : (
                <div className="space-y-3.5 pt-1">
                  {/* Replacement slots selection */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Stethoscope className="w-3.5 h-3.5 text-indigo-600" />
                        Chọn Bác Sĩ / Phòng Khám thay thế: <span className="text-rose-500">*</span>
                      </span>
                      <button
                        type="button"
                        onClick={fetchReplacementSlots}
                        disabled={loadingSlots}
                        className="text-[11px] font-bold text-cyan-700 hover:text-cyan-900 flex items-center gap-1"
                      >
                        <RefreshCw className={`w-3 h-3 ${loadingSlots ? 'animate-spin' : ''}`} />
                        Làm mới danh sách
                      </button>
                    </div>

                    {loadingSlots ? (
                      <div className="p-4 bg-white border border-amber-200 rounded-xl text-center text-slate-500 flex items-center justify-center gap-2 text-xs">
                        <RefreshCw className="w-4 h-4 animate-spin text-amber-600" />
                        Đang tìm kiếm các slot rảnh cùng chuyên khoa & khung giờ...
                      </div>
                    ) : slotsError ? (
                      <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center justify-between gap-2">
                        <span>{slotsError}</span>
                        <button
                          type="button"
                          onClick={fetchReplacementSlots}
                          className="px-2 py-1 bg-rose-600 text-white rounded text-[11px] font-bold"
                        >
                          Thử lại
                        </button>
                      </div>
                    ) : replacementSlots.length === 0 ? (
                      <div className="p-3.5 bg-white border border-amber-200 rounded-xl text-amber-900 text-xs flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold">Không tìm thấy slot nào khác còn trống!</p>
                          <p className="text-[11px] text-amber-800 mt-0.5">
                            Không có bác sĩ/phòng khám nào khác cùng chuyên khoa còn trống trong khung giờ 
                            ({selectedApt.startTime ? selectedApt.startTime.substring(0, 5) : ''} - {selectedApt.endTime ? selectedApt.endTime.substring(0, 5) : ''}) vào ngày {selectedApt.appointmentDate}.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="grid sm:grid-cols-2 gap-2.5 max-h-48 overflow-y-auto pr-1">
                        {replacementSlots.map((slot) => {
                          const isSelected = selectedReplacementSlotId === slot.id;
                          return (
                            <div
                              key={slot.id}
                              onClick={() => setSelectedReplacementSlotId(slot.id)}
                              className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                                isSelected
                                  ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-200 shadow-sm'
                                  : 'bg-white border-slate-200 hover:border-amber-300 hover:bg-amber-50/40'
                              }`}
                            >
                              <input
                                type="radio"
                                name="replacementSlot"
                                checked={isSelected}
                                onChange={() => setSelectedReplacementSlotId(slot.id)}
                                className="mt-1 text-emerald-600 focus:ring-emerald-500"
                              />
                              <div className="space-y-0.5 flex-1 min-w-0">
                                <div className="font-extrabold text-slate-900 text-xs flex items-center justify-between">
                                  <span className="truncate">{slot.doctorName || 'Bác sĩ thay thế'}</span>
                                  <span className="text-[10px] font-mono font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded">
                                    Slot #{slot.id}
                                  </span>
                                </div>
                                <div className="text-[11px] text-slate-600 flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                  <span className="font-medium truncate">{slot.roomName || `Phòng ${slot.roomNumber || ''}`}</span>
                                </div>
                                <div className="text-[10.5px] font-mono font-bold text-cyan-800">
                                  {slot.startTime ? slot.startTime.substring(0, 5) : ''} - {slot.endTime ? slot.endTime.substring(0, 5) : ''}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Optional Reason / Notes */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-800 block text-xs flex items-center gap-1">
                      Ghi chú / Lý do đổi Bác sĩ: <span className="text-slate-400 font-normal">(tùy chọn)</span>
                    </label>
                    <input
                      type="text"
                      value={reassignReason}
                      onChange={(e) => setReassignReason(e.target.value)}
                      placeholder="Ví dụ: Bác sĩ Minh bận ca mổ khẩn (để trống nếu không cần ghi chú)..."
                      maxLength={1000}
                      className="w-full bg-white border border-amber-300 focus:border-amber-500 rounded-xl p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-amber-100 outline-none"
                    />
                    <p className="text-[10.5px] text-slate-500 italic">
                      * Hệ thống sẽ tự động điều phối lại và xử lý slot cũ để tránh việc phân bổ lặp lại.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Section 1: Thông tin hành chính cơ bản */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-200 pb-2">
              <User className="w-4 h-4 text-cyan-600" />
              1. Thông Tin Hành Chính Cơ Bản
            </h4>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Họ và tên bệnh nhân <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  value={patientForm.fullName}
                  onChange={e => setPatientForm({ ...patientForm, fullName: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 outline-none"
                  placeholder="Nhập họ và tên..."
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Số điện thoại liên hệ <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  value={patientForm.phone}
                  onChange={e => setPatientForm({ ...patientForm, phone: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 outline-none"
                  placeholder="098xxxxxxxx"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Ngày sinh</label>
                <input
                  type="date"
                  value={patientForm.dateOfBirth}
                  onChange={e => setPatientForm({ ...patientForm, dateOfBirth: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Giới tính</label>
                <select
                  value={patientForm.gender}
                  onChange={e => setPatientForm({ ...patientForm, gender: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-medium focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 outline-none"
                >
                  <option value="MALE">Nam (Male)</option>
                  <option value="FEMALE">Nữ (Female)</option>
                  <option value="OTHER">Khác (Other)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Định danh & Giấy tờ */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-200 pb-2">
              <FileText className="w-4 h-4 text-cyan-600" />
              2. Giấy Tờ Định Danh & Dân Tộc
            </h4>

            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Số CMND / CCCD / Định danh</label>
                <input
                  type="text"
                  value={patientForm.identityCard}
                  onChange={e => setPatientForm({ ...patientForm, identityCard: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 outline-none"
                  placeholder="Số căn cước công dân..."
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Ngày cấp CMND/CCCD</label>
                <input
                  type="date"
                  value={patientForm.cardIssueDate}
                  onChange={e => setPatientForm({ ...patientForm, cardIssueDate: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nghề nghiệp</label>
                <input
                  type="text"
                  value={patientForm.occupation}
                  onChange={e => setPatientForm({ ...patientForm, occupation: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 outline-none"
                  placeholder="Công việc hiện tại..."
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Dân tộc</label>
                <input
                  type="text"
                  value={patientForm.ethnicity}
                  onChange={e => setPatientForm({ ...patientForm, ethnicity: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Quốc tịch</label>
                <input
                  type="text"
                  value={patientForm.nationality}
                  onChange={e => setPatientForm({ ...patientForm, nationality: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Quan hệ tài khoản</label>
                <input
                  type="text"
                  value={patientForm.relationship}
                  onChange={e => setPatientForm({ ...patientForm, relationship: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 outline-none"
                  placeholder="Bản thân / Con / Người thân..."
                />
              </div>
            </div>
          </div>

          {/* Section 3: Địa chỉ liên hệ */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-200 pb-2">
              <CreditCard className="w-4 h-4 text-cyan-600" />
              3. Địa Chỉ Thường Trú / Chỗ Ở Hiện Tại
            </h4>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Địa chỉ chi tiết (Số nhà, đường, phường/xã, quận/huyện, tỉnh/TP)</label>
              <input
                type="text"
                value={patientForm.address}
                onChange={e => setPatientForm({ ...patientForm, address: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 outline-none"
                placeholder="Nhập địa chỉ bệnh nhân..."
              />
            </div>
          </div>

          {/* Modal Footer Controls */}
          <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 text-xs rounded-xl transition"
            >
              Hủy / Đóng
            </button>

            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={savingProfile}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 font-bold text-white text-xs rounded-xl shadow-sm transition disabled:opacity-50 flex items-center gap-1.5"
              >
                {savingProfile ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5 text-cyan-400" />}
                <span>Lưu Hồ Sơ</span>
              </button>

              {formValidationMsg && (
                <div className="w-full text-rose-600 font-bold text-xs bg-rose-50 border border-rose-200 rounded-xl p-2.5 text-right">
                  {formValidationMsg}
                </div>
              )}

              {isConfirmedTab && (
                <button
                  type="button"
                  disabled={savingProfile || loading || (isReassigning && !selectedReplacementSlotId)}
                  onClick={handleCheckInSubmit}
                  className={`px-5 py-2.5 font-extrabold text-white text-xs rounded-xl shadow-md active:scale-95 transition flex items-center gap-2 disabled:opacity-50 ${
                    isReassigning
                      ? 'bg-gradient-to-r from-amber-600 to-emerald-600 hover:from-amber-500 hover:to-emerald-500'
                      : 'bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500'
                  }`}
                >
                  <UserCheck className="w-4 h-4" />
                  <span>{isReassigning ? 'XÁC NHẬN ĐỔI BÁC SĨ & CHECK-IN' : 'LƯU HỒ SƠ & CHECK-IN NGAY'}</span>
                </button>
              )}
            </div>
          </div>

        </form>

      </div>
    </div>
  );
}
