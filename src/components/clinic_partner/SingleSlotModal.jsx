import React, { useState, useEffect } from 'react';
import { X, Plus, AlertTriangle } from 'lucide-react';

export const SingleSlotModal = ({
  isOpen,
  onClose,
  doctors = [],
  rooms = [],
  onSubmit,
  saving = false,
  modalError = null,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    doctorId: '',
    appointmentDate: todayStr,
    startTime: '08:00',
    endTime: '08:30',
    roomId: '',
    roomName: '',
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        doctorId: '',
        appointmentDate: todayStr,
        startTime: '08:00',
        endTime: '08:30',
        roomId: '',
        roomName: '',
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(formData, e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Plus className="w-5 h-5 text-cyan-600" /> Tạo Ca khám Đơn lẻ (Tương lai)
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Overlap & Future Date Error Alert in Modal */}
        {modalError && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-start gap-3 text-xs">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed font-semibold">{modalError}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Chọn Bác sĩ <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.doctorId}
              onChange={(e) => setFormData((prev) => ({ ...prev, doctorId: e.target.value }))}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-sm focus:bg-white focus:border-cyan-600"
            >
              <option value="">-- Chọn bác sĩ --</option>
              {doctors.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.fullName} (ID: #{doc.id})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Ngày khám (Tương lai) <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              required
              min={todayStr}
              value={formData.appointmentDate}
              onChange={(e) => setFormData((prev) => ({ ...prev, appointmentDate: e.target.value }))}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-sm focus:bg-white focus:border-cyan-600"
            />
            <span className="text-[11px] text-slate-500 mt-1 block">Chỉ chọn từ ngày hôm nay trở đi.</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Giờ bắt đầu <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                required
                value={formData.startTime}
                onChange={(e) => setFormData((prev) => ({ ...prev, startTime: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-sm focus:bg-white focus:border-cyan-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Giờ kết thúc <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                required
                value={formData.endTime}
                onChange={(e) => setFormData((prev) => ({ ...prev, endTime: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-sm focus:bg-white focus:border-cyan-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Chọn Phòng khám <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.roomId}
              onChange={(e) => {
                const selectedId = e.target.value;
                const roomObj = rooms.find((r) => String(r.id) === String(selectedId));
                setFormData((prev) => ({
                  ...prev,
                  roomId: selectedId,
                  roomName: roomObj ? `${roomObj.name} (Phòng ${roomObj.roomNumber})` : prev.roomName,
                }));
              }}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-sm focus:bg-white focus:border-cyan-600"
            >
              <option value="">-- Chọn phòng khám --</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  Phòng {room.roomNumber} - {room.name} {room.roomType ? `(${room.roomType})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-xl shadow-md transition disabled:opacity-50"
            >
              {saving ? 'Đang kiểm tra & tạo...' : 'Tạo Slot Khám'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
