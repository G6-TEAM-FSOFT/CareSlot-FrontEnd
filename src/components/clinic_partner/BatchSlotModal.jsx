import React, { useState, useEffect } from 'react';
import { X, Layers, AlertTriangle } from 'lucide-react';

export const BatchSlotModal = ({
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
    roomId: '',
    roomName: '',
    startHour: 8,
    endHour: 11,
    durationMinutes: 30,
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        doctorId: '',
        appointmentDate: todayStr,
        roomId: '',
        roomName: '',
        startHour: 8,
        endHour: 11,
        durationMinutes: 30,
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
            <Layers className="w-5 h-5 text-cyan-600" /> Tạo Ca khám Hàng loạt (Batch Slots)
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Overlap Error Alert in Modal */}
        {modalError && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-start gap-3 text-xs">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed font-semibold">{modalError}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Chọn Bác sĩ *</label>
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
            <label className="block text-xs font-semibold text-slate-700 mb-1">Ngày khám (Tương lai) *</label>
            <input
              type="date"
              required
              min={todayStr}
              value={formData.appointmentDate}
              onChange={(e) => setFormData((prev) => ({ ...prev, appointmentDate: e.target.value }))}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-sm focus:bg-white focus:border-cyan-600"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Từ giờ (Hour)</label>
              <input
                type="number"
                min="6"
                max="20"
                value={formData.startHour}
                onChange={(e) => setFormData((prev) => ({ ...prev, startHour: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Đến giờ (Hour)</label>
              <input
                type="number"
                min="7"
                max="22"
                value={formData.endHour}
                onChange={(e) => setFormData((prev) => ({ ...prev, endHour: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Thời lượng (Phút)</label>
              <select
                value={formData.durationMinutes}
                onChange={(e) => setFormData((prev) => ({ ...prev, durationMinutes: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-sm"
              >
                <option value="15">15 phút</option>
                <option value="30">30 phút</option>
                <option value="45">45 phút</option>
                <option value="60">60 phút</option>
              </select>
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
              {saving ? 'Đang tự động sinh ca...' : 'Xác nhận tạo hàng loạt'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
