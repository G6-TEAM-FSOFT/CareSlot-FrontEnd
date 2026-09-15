import React from 'react';
import { Building2, RefreshCw } from 'lucide-react';

export const RoomFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
  editingRoom,
  departments,
  roomTypeLabels,
  isSaving
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-gray-100">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-600" />
            {editingRoom ? 'Chỉnh Sửa Phòng Khám' : 'Tạo Phòng Khám Mới'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-200 transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4">
          {/* Department Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
              Khoa phòng <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.departmentId}
              onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
              required
              className="w-full py-2.5 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">-- Chọn khoa phòng --</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
              ))}
            </select>
          </div>

          {/* Room Number */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
              Mã / Số phòng <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Ví dụ: P.101, ROOM-02"
              value={formData.roomNumber}
              onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
              required
              className="w-full py-2.5 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Room Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
              Tên phòng khám <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Ví dụ: Phòng Khám Nội Tổng Hợp 1"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full py-2.5 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Room Type */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
              Loại chức năng phòng
            </label>
            <select
              value={formData.roomType}
              onChange={(e) => setFormData({ ...formData, roomType: e.target.value })}
              className="w-full py-2.5 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {Object.entries(roomTypeLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
              Trạng thái hoạt động
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full py-2.5 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ACTIVE">Hoạt động (Active)</option>
              <option value="INACTIVE">Tạm dừng (Inactive)</option>
            </select>
          </div>

          {/* Modal Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
            >
              {isSaving && <RefreshCw className="w-4 h-4 animate-spin" />}
              {editingRoom ? 'Cập Nhật' : 'Tạo Mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoomFormModal;
