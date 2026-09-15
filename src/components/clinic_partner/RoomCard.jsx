import React from 'react';
import { Layers, Calendar, Eye, Edit, Trash2 } from 'lucide-react';

export const RoomCard = ({ room, roomTypeLabels, onDetail, onEdit, onDelete }) => {
  const total = room.totalSlots || 0;
  const available = room.availableSlots || 0;
  const booked = room.bookedSlots || 0;
  const held = room.heldSlots || 0;

  const availPct = total > 0 ? (available / total) * 100 : 0;
  const bookedPct = total > 0 ? (booked / total) * 100 : 0;
  const heldPct = total > 0 ? (held / total) * 100 : 0;

  let slotBadgeColor = "bg-gray-100 text-gray-600";
  let slotBadgeText = "Chưa có slot";
  if (total >= 8) {
    slotBadgeColor = "bg-emerald-100 text-emerald-700 font-semibold";
    slotBadgeText = "Nhiều Slot";
  } else if (total > 0) {
    slotBadgeColor = "bg-blue-100 text-blue-700 font-semibold";
    slotBadgeText = "Có Slot";
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col justify-between space-y-4">
      {/* Header: Room Number & Status */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg tracking-wide uppercase">
              {room.roomNumber}
            </span>
            <span className={`px-2.5 py-0.5 text-xs rounded-full ${slotBadgeColor}`}>
              {slotBadgeText}
            </span>
          </div>

          <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
            room.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
          }`}>
            {room.status === 'ACTIVE' ? 'Hoạt động' : 'Tạm dừng'}
          </span>
        </div>

        <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
          {room.name}
        </h3>

        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
          <Layers className="w-3.5 h-3.5 text-gray-400" />
          <span>{room.departmentName || 'Khoa chưa phân loại'}</span>
          <span>•</span>
          <span className="text-gray-600 font-medium">
            {roomTypeLabels[room.roomType] || room.roomType}
          </span>
        </div>
      </div>

      {/* Schedule & Slot Health Bar */}
      <div className="bg-gray-50 p-3.5 rounded-xl space-y-2 border border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-700">
          <span className="font-semibold flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-indigo-500" />
            Lịch ca khám
          </span>
          <span className="font-bold text-gray-900">{total} slots</span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden flex">
          <div className="bg-emerald-500 h-full transition-all" style={{ width: `${availPct}%` }} title={`Còn trống: ${available}`} />
          <div className="bg-blue-600 h-full transition-all" style={{ width: `${bookedPct}%` }} title={`Đã đặt: ${booked}`} />
          <div className="bg-amber-400 h-full transition-all" style={{ width: `${heldPct}%` }} title={`Tạm giữ: ${held}`} />
        </div>

        {/* Stats Detail Pill Labels */}
        <div className="grid grid-cols-3 gap-1 pt-1 text-[11px] text-center font-medium">
          <div className="bg-emerald-50 text-emerald-700 py-0.5 rounded">
            Trống: {available}
          </div>
          <div className="bg-blue-50 text-blue-700 py-0.5 rounded">
            Đã đặt: {booked}
          </div>
          <div className="bg-amber-50 text-amber-700 py-0.5 rounded">
            Giữ: {held}
          </div>
        </div>
      </div>

      {/* Actions Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <button
          onClick={() => onDetail(room)}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-200"
        >
          <Eye className="w-3.5 h-3.5" />
          Chi tiết & Lịch hẹn
        </button>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(room)}
            className="p-1.5 text-gray-600 hover:text-indigo-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Chỉnh sửa phòng"
          >
            <Edit className="w-4 h-4" />
          </button>

          <button
            onClick={() => onDelete(room)}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Xóa phòng"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoomCard;
