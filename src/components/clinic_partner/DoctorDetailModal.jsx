import React, { useState } from 'react';
import { 
  RefreshCw, Calendar, Filter, User, Building2, ExternalLink, Clock, CalendarClock, Stethoscope
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const DoctorDetailModal = ({
  selectedDoctor,
  onClose,
  formatCurrency,
  timeFilter,
  onTimeFilterChange,
  statusBadgeConfig,
  appointments = [],
  loadingAppointments = false,
  doctorSlots = [],
  loadingDoctorSlots = false,
  appointmentStatusFilter,
  setAppointmentStatusFilter
}) => {
  const [activeTab, setActiveTab] = useState('SLOTS'); // 'SLOTS' | 'APPOINTMENTS'
  const [slotDateFilter, setSlotDateFilter] = useState('TODAY'); // 'TODAY' | 'ALL'
  const [slotStatusFilter, setSlotStatusFilter] = useState('');

  if (!selectedDoctor) return null;

  const todayStr = new Date().toISOString().split('T')[0];

  // Filter doctor slots
  const filteredSlots = doctorSlots.filter(s => {
    if (slotDateFilter === 'TODAY' && s.appointmentDate !== todayStr) return false;
    if (slotStatusFilter && s.status !== slotStatusFilter) return false;
    return true;
  });

  // Filter doctor appointments
  const filteredAppointments = appointments.filter(app => {
    if (!appointmentStatusFilter) return true;
    return app.status === appointmentStatusFilter;
  });

  const todaySlotsCount = doctorSlots.filter(s => s.appointmentDate === todayStr).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
        {/* Header Banner */}
        <div className="px-6 py-5 bg-gradient-to-r from-cyan-800 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-white/10 border-2 border-cyan-400 overflow-hidden flex items-center justify-center font-bold text-white text-xl shadow-md shrink-0">
              {selectedDoctor.avatarUrl ? (
                <img src={selectedDoctor.avatarUrl} alt={selectedDoctor.fullName} className="w-full h-full object-cover" />
              ) : (
                <span>{selectedDoctor.fullName?.charAt(0) || 'D'}</span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-cyan-500/30 text-cyan-200 text-xs font-bold rounded uppercase">
                  {selectedDoctor.title || 'BS'}
                </span>
                <span className="text-xs text-cyan-300 font-medium">
                  {selectedDoctor.specialtyName || selectedDoctor.specialty?.name}
                </span>
              </div>
              <h3 className="font-bold text-xl text-white mt-1">
                {selectedDoctor.fullName}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Sub-Header Profile Metrics */}
        <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-slate-500">Giá khám: </span>
              <strong className="text-emerald-700 font-bold">{formatCurrency(selectedDoctor.consultationFee)}</strong>
            </div>
            <div>
              <span className="text-slate-500">Trạng thái: </span>
              <span className={`font-semibold ${selectedDoctor.status === 'ACTIVE' ? 'text-emerald-600' : 'text-red-600'}`}>
                {selectedDoctor.status === 'ACTIVE' ? 'Hoạt động (Active)' : 'Ngừng khám'}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 bg-white border-b border-slate-200 flex items-center gap-4">
          <button
            onClick={() => setActiveTab('SLOTS')}
            className={`py-3 px-1 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'SLOTS'
                ? 'border-cyan-600 text-cyan-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Lịch làm việc / Ca khám ({todaySlotsCount} hôm nay)</span>
          </button>

          <button
            onClick={() => setActiveTab('APPOINTMENTS')}
            className={`py-3 px-1 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'APPOINTMENTS'
                ? 'border-cyan-600 text-cyan-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Lịch hẹn khám bệnh nhân ({appointments.length})</span>
          </button>
        </div>

        {/* Tab 1: Doctor Slots Content */}
        {activeTab === 'SLOTS' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Slot Filters Sub-Bar */}
            <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-600">Thời gian:</span>
                <button
                  onClick={() => setSlotDateFilter('TODAY')}
                  className={`px-2.5 py-1 rounded-md font-semibold transition ${
                    slotDateFilter === 'TODAY'
                      ? 'bg-cyan-700 text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Hôm nay ({todayStr})
                </button>
                <button
                  onClick={() => setSlotDateFilter('ALL')}
                  className={`px-2.5 py-1 rounded-md font-semibold transition ${
                    slotDateFilter === 'ALL'
                      ? 'bg-cyan-700 text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Tất cả ca khám
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-600">Trạng thái:</span>
                <select
                  value={slotStatusFilter}
                  onChange={(e) => setSlotStatusFilter(e.target.value)}
                  className="bg-white border border-slate-200 rounded-md px-2 py-1 text-xs font-medium text-slate-700"
                >
                  <option value="">Tất cả</option>
                  <option value="AVAILABLE">AVAILABLE (Trống)</option>
                  <option value="HELD">HELD (Đang giữ chỗ)</option>
                  <option value="BOOKED">BOOKED (Đã được đặt)</option>
                  <option value="OVER_DATE">OVER_DATE (Quá hạn)</option>
                </select>
              </div>
            </div>

            {/* Slots List Body */}
            <div className="p-6 overflow-y-auto flex-1">
              {loadingDoctorSlots ? (
                <div className="py-12 text-center text-slate-500 flex flex-col items-center gap-2">
                  <RefreshCw className="w-7 h-7 animate-spin text-cyan-600" />
                  <p className="text-sm">Đang nạp lịch làm việc của bác sĩ...</p>
                </div>
              ) : filteredSlots.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <CalendarClock className="w-10 h-10 mx-auto text-slate-300" />
                  <p className="text-sm font-medium text-slate-700">
                    Bác sĩ chưa có ca khám nào {slotDateFilter === 'TODAY' ? 'ngày hôm nay' : ''}
                  </p>
                  <p className="text-xs text-slate-400">
                    {slotDateFilter === 'TODAY' ? 'Thử chọn "Tất cả ca khám" để kiểm tra các ngày khác.' : ''}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredSlots.map(slot => (
                    <div
                      key={slot.id}
                      className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-2 hover:border-cyan-500 transition shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-slate-900">
                          <Clock className="w-3.5 h-3.5 text-cyan-600" />
                          <span>{slot.startTime} - {slot.endTime}</span>
                        </div>
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                            slot.status === 'AVAILABLE'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : slot.status === 'HELD'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : slot.status === 'BOOKED'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-purple-50 text-purple-700 border-purple-200'
                          }`}
                        >
                          {slot.status}
                        </span>
                      </div>

                      <div className="text-xs space-y-1 text-slate-600 border-t border-slate-100 pt-2">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 flex items-center gap-1">
                            <Building2 className="w-3 h-3" /> Phòng:
                          </span>
                          <span className="font-medium text-slate-900 truncate max-w-[150px]">{slot.roomName || 'Chưa xếp phòng'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Ngày:</span>
                          <span className="font-mono text-cyan-700 font-semibold">{slot.appointmentDate}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Doctor Appointments Content */}
        {activeTab === 'APPOINTMENTS' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Time Filter Sub-Bar */}
            <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200">
                <button
                  onClick={() => onTimeFilterChange('PRESENT_FUTURE')}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                    timeFilter === 'PRESENT_FUTURE'
                      ? 'bg-cyan-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Lịch Hiện tại & Tương lai
                </button>
                <button
                  onClick={() => onTimeFilterChange('ALL')}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                    timeFilter === 'ALL'
                      ? 'bg-cyan-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Tất cả lịch sử
                </button>
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto">
                <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5" /> Trạng thái:
                </span>
                {[
                  { key: '', label: 'Tất cả' },
                  { key: 'CONFIRMED', label: 'Đã xác nhận' },
                  { key: 'CHECKED_IN', label: 'Đã vào khám' },
                  { key: 'COMPLETED', label: 'Hoàn thành' },
                  { key: 'PENDING_PAYMENT', label: 'Chờ thanh toán' },
                  { key: 'CANCELLED', label: 'Đã hủy' }
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setAppointmentStatusFilter(tab.key)}
                    className={`px-2.5 py-0.5 text-xs font-medium rounded-lg transition-colors ${
                      appointmentStatusFilter === tab.key 
                        ? 'bg-slate-800 text-white font-bold' 
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Appointments Body Table */}
            <div className="p-6 overflow-y-auto flex-1">
              {loadingAppointments ? (
                <div className="py-12 text-center text-slate-500 flex flex-col items-center gap-2">
                  <RefreshCw className="w-7 h-7 animate-spin text-cyan-600" />
                  <p className="text-sm">Đang nạp danh sách lịch khám của bác sĩ...</p>
                </div>
              ) : filteredAppointments.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <Calendar className="w-10 h-10 mx-auto text-slate-300" />
                  <p className="text-sm font-medium text-slate-700">
                    Không có lịch hẹn nào {timeFilter === 'PRESENT_FUTURE' ? 'trong hiện tại & tương lai' : ''}
                  </p>
                  <p className="text-xs text-slate-400">
                    {timeFilter === 'PRESENT_FUTURE' ? 'Thử chuyển sang chế độ "Tất cả lịch sử" để kiểm tra ca khám quá khứ.' : ''}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[11px]">
                      <tr>
                        <th className="px-3 py-2.5 rounded-l-lg">Mã đặt khám</th>
                        <th className="px-3 py-2.5">Bệnh nhân</th>
                        <th className="px-3 py-2.5">Ngày & Giờ khám</th>
                        <th className="px-3 py-2.5">Phòng khám</th>
                        <th className="px-3 py-2.5">Lý do / Triệu chứng</th>
                        <th className="px-3 py-2.5">Trạng thái</th>
                        <th className="px-3 py-2.5 rounded-r-lg text-right">Chi tiết</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredAppointments.map(app => {
                        const badge = statusBadgeConfig[app.status] || { label: app.status, bg: 'bg-slate-100 text-slate-700' };
                        return (
                          <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="px-3 py-3 font-mono font-bold text-cyan-700">
                              {app.bookingCode || `#${app.id}`}
                            </td>
                            <td className="px-3 py-3 font-semibold text-slate-900">
                              <div className="flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5 text-slate-400" />
                                {app.patientName || 'N/A'}
                              </div>
                            </td>
                            <td className="px-3 py-3 font-medium text-slate-900">
                              <div>{app.appointmentDate}</div>
                              <div className="text-[11px] text-slate-500 font-normal">
                                {app.startTime?.substring(0, 5)} - {app.endTime?.substring(0, 5)}
                              </div>
                            </td>
                            <td className="px-3 py-3 font-medium text-slate-800">
                              <div className="flex items-center gap-1.5">
                                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                                {app.roomName || 'Chưa chỉ định'}
                              </div>
                            </td>
                            <td className="px-3 py-3 text-slate-600 max-w-xs truncate" title={app.symptomNote}>
                              {app.symptomNote || 'Khám bệnh'}
                            </td>
                            <td className="px-3 py-3">
                              <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${badge.bg}`}>
                                {badge.label}
                              </span>
                            </td>
                            <td className="px-3 py-3 text-right">
                              <Link
                                to={`/clinic-partner/appointments/${app.id}`}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-cyan-700 hover:text-cyan-900 hover:bg-cyan-50 rounded-lg transition-colors"
                              >
                                Xem <ExternalLink className="w-3 h-3" />
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>
            {activeTab === 'SLOTS'
              ? `Hiển thị ${filteredSlots.length} / ${doctorSlots.length} ca khám`
              : `Hiển thị ${filteredAppointments.length} / ${appointments.length} lịch hẹn`}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-xl transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoctorDetailModal;
