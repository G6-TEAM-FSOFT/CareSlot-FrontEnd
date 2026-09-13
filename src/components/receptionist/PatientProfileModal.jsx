import React, { useState } from 'react';
import { UserCheck, User, FileText, CreditCard, X, RefreshCw, Save, Calendar, Clock, Stethoscope, MapPin } from 'lucide-react';

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
  onSaveProfileAndCheckIn
}) {
  if (!show || !selectedApt) return null;

  const isConfirmedTab = listTab === 'CONFIRMED' && selectedApt.status !== 'CHECKED_IN' && selectedApt.status !== 'COMPLETED';
  const [formValidationMsg, setFormValidationMsg] = useState('');

  const handleCheckInSubmit = (e) => {
    setFormValidationMsg('');
    onSaveProfileAndCheckIn(e, {});
  };

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
              <span className="px-2.5 py-0.5 rounded-md bg-cyan-100 text-cyan-900 border border-cyan-300 font-mono font-bold text-[11px]">
                #{selectedApt.id} • Mã Booking: {selectedApt.bookingCode || 'BK-N/A'}
              </span>
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
                  disabled={savingProfile || loading}
                  onClick={handleCheckInSubmit}
                  className="px-5 py-2.5 font-extrabold text-white text-xs rounded-xl shadow-md active:scale-95 transition flex items-center gap-2 disabled:opacity-50 bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 cursor-pointer"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>LƯU HỒ SƠ & CHECK-IN NGAY</span>
                </button>
              )}
            </div>
          </div>

        </form>

      </div>
    </div>
  );
}
