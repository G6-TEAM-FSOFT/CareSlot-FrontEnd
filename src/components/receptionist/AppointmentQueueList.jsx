import React from 'react';
import { UserCheck, Clock, Activity, CheckCircle2, Search, RefreshCw, User, Eye, Calendar, FileText } from 'lucide-react';

export default function AppointmentQueueList({
  listTab,
  setListTab,
  filteredAppointments,
  searchQuery,
  setSearchQuery,
  manualAptId,
  setManualAptId,
  fetchingApts,
  loading,
  onOpenPatientModal,
  onCheckIn,
  onSelectVisitByAppointmentId
}) {
  return (
    <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 space-y-6 shadow-sm">
      
      {/* List Header & Tabs */}
      <div className="space-y-3 border-b border-slate-200 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-cyan-600" />
            1. Quản Lý Danh Sách Bệnh Nhân
          </h2>
          <span className="text-xs px-2.5 py-1 bg-cyan-50 border border-cyan-200 text-cyan-800 font-mono font-bold rounded-lg">
            {filteredAppointments.length} Bệnh nhân
          </span>
        </div>

        {/* Tabs Switcher: CONFIRMED vs CHECKED_IN vs COMPLETED */}
        <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 text-xs font-bold">
          <button
            type="button"
            onClick={() => setListTab('CONFIRMED')}
            className={`py-2 rounded-xl transition flex items-center justify-center gap-1 ${
              listTab === 'CONFIRMED'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Chờ Check-in</span>
          </button>

          <button
            type="button"
            onClick={() => setListTab('CHECKED_IN')}
            className={`py-2 rounded-xl transition flex items-center justify-center gap-1 ${
              listTab === 'CHECKED_IN'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-amber-300" />
            <span>Đang Khám</span>
          </button>

          <button
            type="button"
            onClick={() => setListTab('COMPLETED')}
            className={`py-2 rounded-xl transition flex items-center justify-center gap-1 ${
              listTab === 'COMPLETED'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" />
            <span>Đã Hoàn Tất</span>
          </button>
        </div>
      </div>

      {/* Search and Manual ID Bar */}
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Tìm tên, SĐT, mã đặt lịch..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-cyan-500 outline-none"
          />
        </div>

        {listTab === 'CONFIRMED' && (
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="ID Lịch hẹn..."
              value={manualAptId}
              onChange={e => setManualAptId(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-cyan-500 outline-none font-mono"
            />
            <button
              disabled={!manualAptId || loading}
              onClick={() => onCheckIn(parseInt(manualAptId))}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 font-bold text-white text-xs rounded-xl shadow-sm whitespace-nowrap transition-all disabled:opacity-50"
            >
              CHECK-IN
            </button>
          </div>
        )}
      </div>

      {/* Appointments Cards List */}
      <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
        {fetchingApts ? (
          <div className="text-center py-12 text-slate-500 text-xs flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-cyan-600" /> Đang tải danh sách bệnh nhân...
          </div>
        ) : filteredAppointments.length > 0 ? (
          filteredAppointments.map(apt => {
            const patientName = apt.patientProfile?.fullName || apt.patientName || 'Bệnh nhân';
            const phone = apt.patientProfile?.phone || apt.patientPhone || 'N/A';
            const gender = apt.patientProfile?.gender || apt.patientGender;
            const dob = apt.patientProfile?.dateOfBirth || apt.patientProfile?.dob || apt.patientDob;
            const doctorName = apt.doctorName || apt.slot?.doctor?.fullName || 'BS. Chuyên Khoa';
            const roomName = apt.roomName ? `${apt.roomName}${apt.specialtyName ? ` (${apt.specialtyName})` : ''}` : (apt.specialtyName || 'Phòng khám Ngoại Trú');
            const timeSlot = apt.startTime ? `${apt.startTime.substring(0, 5)}${apt.endTime ? ` - ${apt.endTime.substring(0, 5)}` : ''}` : 'Giờ hẹn linh hoạt';
            const aptDate = apt.appointmentDate || 'Hôm nay';
            const symptom = apt.symptomNote;

            return (
              <div 
                key={apt.id} 
                className="bg-slate-50 hover:bg-white border border-slate-200 rounded-2xl p-4 space-y-3 transition-all hover:border-slate-300 shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900 text-base">{patientName}</span>
                    <span className="text-[10px] font-mono font-bold text-cyan-800 bg-cyan-50 border border-cyan-200 px-2 py-0.5 rounded-md">
                      #{apt.id} ({apt.bookingCode || 'BK-N/A'})
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {gender && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200/70 text-slate-700">
                        {gender === 'MALE' ? 'Nam' : gender === 'FEMALE' ? 'Nữ' : 'Khác'}
                      </span>
                    )}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      apt.status === 'CONFIRMED' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                      apt.status === 'CHECKED_IN' ? 'bg-indigo-50 text-indigo-800 border-indigo-200' :
                      'bg-emerald-50 text-emerald-800 border-emerald-200'
                    }`}>
                      {apt.status || 'CONFIRMED'}
                    </span>
                  </div>
                </div>

                {/* Structured Details: Personal Info & Appointment Info */}
                <div className="grid sm:grid-cols-2 gap-2 text-xs text-slate-600">
                  <div className="space-y-1">
                    <div><strong className="text-slate-500">SĐT Bệnh nhân:</strong> <span className="font-mono text-slate-900 font-bold">{phone}</span></div>
                    {dob && <div><strong className="text-slate-500">Ngày sinh:</strong> <span className="font-mono text-slate-800">{dob}</span></div>}
                    <div><strong className="text-slate-500">Phòng khám:</strong> <span className="font-semibold text-slate-800">{roomName}</span></div>
                  </div>

                  <div className="space-y-1">
                    <div><strong className="text-slate-500">Bác sĩ phụ trách:</strong> <span className="font-bold text-emerald-700">{doctorName}</span></div>
                    <div><strong className="text-slate-500">Lịch hẹn:</strong> <span className="font-mono font-bold text-cyan-800">{aptDate} ({timeSlot})</span></div>
                    {symptom && <div className="truncate"><strong className="text-slate-500">Lý do:</strong> <span className="italic text-slate-700">{symptom}</span></div>}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="pt-2 border-t border-slate-200/80 flex flex-wrap items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => onOpenPatientModal(apt)}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-cyan-50 text-cyan-800 hover:text-cyan-900 font-bold text-xs rounded-xl border border-slate-200 hover:border-cyan-300 transition-all flex items-center gap-1.5"
                    title="Xem thông tin cá nhân & chi tiết lịch hẹn"
                  >
                    <Eye className="w-3.5 h-3.5 text-cyan-600" />
                    <span>Xem TT Bệnh Nhân & Lịch Hẹn</span>
                  </button>

                  {listTab === 'CONFIRMED' ? (
                    <button
                      disabled={loading}
                      onClick={() => onOpenPatientModal(apt, false)}
                      className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 font-extrabold text-white text-xs rounded-xl transition-all shadow-sm active:scale-95 flex items-center gap-1.5"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>CHECK-IN & XEM HỒ SƠ</span>
                    </button>
                  ) : (
                    <button
                      disabled={loading}
                      onClick={() => onSelectVisitByAppointmentId(apt.id)}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 font-extrabold text-white text-xs rounded-xl transition-all shadow-sm active:scale-95 flex items-center gap-1.5"
                    >
                      <Eye className="w-4 h-4 text-cyan-200" />
                      <span>Xem Đợt Khám & Thu Tiền</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center text-slate-500 space-y-3">
            <UserCheck className="w-10 h-10 text-slate-400 mx-auto" />
            <p className="text-sm font-medium">Chưa tìm thấy bệnh nhân trong danh sách tab này.</p>
          </div>
        )}
      </div>

    </div>
  );
}
