import React from 'react';
import { 
  RefreshCw, Calendar, Filter, User, Stethoscope, ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const RoomDetailModal = ({
  selectedRoom,
  onClose,
  roomTypeLabels,
  statusBadgeConfig,
  appointments,
  loadingAppointments,
  appointmentStatusFilter,
  setAppointmentStatusFilter
}) => {
  if (!selectedRoom) return null;

  const filteredAppointments = appointments.filter(app => {
    if (!appointmentStatusFilter) return true;
    return app.status === appointmentStatusFilter;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-900 to-slate-800 text-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-indigo-500/30 text-indigo-200 text-xs font-bold rounded uppercase">
                {selectedRoom.roomNumber}
              </span>
              <span className="text-xs text-indigo-300">
                {selectedRoom.departmentName}
              </span>
            </div>
            <h3 className="font-bold text-xl text-white mt-1">
              {selectedRoom.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-300 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Sub-Header Room Metrics */}
        <div className="bg-slate-50 px-6 py-3 border-b border-gray-200 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-gray-500">Loại phòng: </span>
              <span className="font-semibold text-gray-800">{roomTypeLabels[selectedRoom.roomType] || selectedRoom.roomType}</span>
            </div>
            <div>
              <span className="text-gray-500">Trạng thái phòng: </span>
              <span className={`font-semibold ${selectedRoom.status === 'ACTIVE' ? 'text-emerald-600' : 'text-red-600'}`}>
                {selectedRoom.status === 'ACTIVE' ? 'Hoạt động' : 'Tạm dừng'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 font-semibold">
            <span className="bg-white px-2.5 py-1 rounded-lg border border-gray-200 text-gray-700">
              Tổng: <strong className="text-indigo-600">{selectedRoom.totalSlots || 0}</strong> slots
            </span>
            <span className="bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 text-emerald-700">
              Trống: <strong>{selectedRoom.availableSlots || 0}</strong>
            </span>
            <span className="bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 text-blue-700">
              Đã đặt: <strong>{selectedRoom.bookedSlots || 0}</strong>
            </span>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="px-6 py-3 border-b border-gray-100 flex items-center justify-between gap-2 overflow-x-auto">
          <span className="text-xs font-bold text-gray-500 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Lọc trạng thái:
          </span>
          <div className="flex items-center gap-1.5">
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
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                  appointmentStatusFilter === tab.key 
                    ? 'bg-indigo-600 text-white font-bold' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Appointments Body List */}
        <div className="p-6 overflow-y-auto flex-1">
          {loadingAppointments ? (
            <div className="py-12 text-center text-gray-500 flex flex-col items-center gap-2">
              <RefreshCw className="w-7 h-7 animate-spin text-indigo-600" />
              <p className="text-sm">Đang nạp danh sách lịch hẹn của phòng...</p>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="py-12 text-center text-gray-400 space-y-2">
              <Calendar className="w-10 h-10 mx-auto text-gray-300" />
              <p className="text-sm font-medium text-gray-600">Chưa có lịch hẹn nào trong phòng này</p>
              <p className="text-xs text-gray-400">Các ca khám (slot) khi được bệnh nhân đăng ký sẽ tự động hiển thị tại đây.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-600">
                <thead className="bg-gray-50 text-gray-500 uppercase font-semibold text-[11px]">
                  <tr>
                    <th className="px-3 py-2.5 rounded-l-lg">Mã đặt khám</th>
                    <th className="px-3 py-2.5">Bệnh nhân</th>
                    <th className="px-3 py-2.5">Bác sĩ phụ trách</th>
                    <th className="px-3 py-2.5">Thời gian khám</th>
                    <th className="px-3 py-2.5">Lý do / Triệu chứng</th>
                    <th className="px-3 py-2.5">Trạng thái</th>
                    <th className="px-3 py-2.5 rounded-r-lg text-right">Chi tiết</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredAppointments.map(app => {
                    const badge = statusBadgeConfig[app.status] || { label: app.status, bg: 'bg-gray-100 text-gray-700' };
                    return (
                      <tr key={app.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="px-3 py-3 font-mono font-bold text-indigo-600">
                          {app.bookingCode || `#${app.id}`}
                        </td>
                        <td className="px-3 py-3 font-semibold text-gray-900">
                          <div className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-gray-400" />
                            {app.patientName || 'N/A'}
                          </div>
                        </td>
                        <td className="px-3 py-3 text-gray-800">
                          <div className="flex items-center gap-1.5">
                            <Stethoscope className="w-3.5 h-3.5 text-indigo-500" />
                            {app.doctorName || 'Chưa phân công'}
                          </div>
                        </td>
                        <td className="px-3 py-3 font-medium text-gray-900">
                          <div>{app.appointmentDate}</div>
                          <div className="text-[11px] text-gray-500 font-normal">
                            {app.startTime?.substring(0, 5)} - {app.endTime?.substring(0, 5)}
                          </div>
                        </td>
                        <td className="px-3 py-3 text-gray-600 max-w-xs truncate" title={app.symptomNote}>
                          {app.symptomNote || 'Khám tổng quát'}
                        </td>
                        <td className="px-3 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${badge.bg}`}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-right">
                          <Link
                            to={`/clinic-partner/appointments/${app.id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors"
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

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <span>Hiển thị <strong>{filteredAppointments.length}</strong> / {appointments.length} lịch hẹn</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-xl transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoomDetailModal;
