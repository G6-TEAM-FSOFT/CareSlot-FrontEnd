import React, { useState, useEffect } from 'react';
import {
  CalendarClock,
  Plus,
  FileSpreadsheet,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  UserCheck,
  Clock,
  MapPin,
  Layers,
  Calendar,
  X,
  AlertTriangle
} from 'lucide-react';
import { partnerSlotService } from '../../services/clinic_partner/partnerSlotService';
import { partnerDoctorService } from '../../services/clinic_partner/partnerDoctorService';
import { ExcelImportModal } from './ExcelImportModal';

export const DoctorSchedulePage = () => {
  const [doctors, setDoctors] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [modalError, setModalError] = useState(null);

  // Filters
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Modals
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [isSingleModalOpen, setIsSingleModalOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [savingSlot, setSavingSlot] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];

  // Single Slot Form
  const [singleFormData, setSingleFormData] = useState({
    doctorId: '',
    appointmentDate: todayStr,
    startTime: '08:00',
    endTime: '08:30',
    roomName: 'Phòng 301 - Tầng 3',
  });

  // Batch Slot Form
  const [batchFormData, setBatchFormData] = useState({
    doctorId: '',
    appointmentDate: todayStr,
    roomName: 'Phòng 301',
    startHour: 8,
    endHour: 11,
    durationMinutes: 30,
  });

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load active doctors
      const resDocs = await partnerDoctorService.getDoctors({ status: 'ACTIVE' });
      const docList = resDocs.data?.content || resDocs.data || resDocs;
      setDoctors(Array.isArray(docList) ? docList : []);

      // Load slots
      await fetchSlots();
    } catch (err) {
      console.error('Failed to load schedule data', err);
      setError(err.message || 'Không thể tải lịch làm việc.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSlots = async () => {
    try {
      const params = {};
      if (selectedDoctorId) params.doctorId = selectedDoctorId;
      if (selectedDate) params.date = selectedDate;
      if (selectedStatus) params.status = selectedStatus;

      const resSlots = await partnerSlotService.getSlots(params);
      const slotList = resSlots.data || resSlots;
      setSlots(Array.isArray(slotList) ? slotList : []);
    } catch (err) {
      console.error('Failed to fetch slots', err);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    fetchSlots();
  }, [selectedDoctorId, selectedDate, selectedStatus]);

  // Handle single slot creation with Future Date validation + Overlap Error Notice
  const handleCreateSingleSlot = async (e) => {
    e.preventDefault();
    setModalError(null);
    setError(null);
    setSuccess(null);

    // Validate future date & time (US-10 constraint)
    const timeStr = singleFormData.startTime.length === 5 ? `${singleFormData.startTime}:00` : singleFormData.startTime;
    const selectedStart = new Date(`${singleFormData.appointmentDate}T${timeStr}`);
    const now = new Date();

    if (selectedStart <= now) {
      setModalError('⚠️ Ca khám mới phải được chọn ở thời điểm tương lai (US-10). Thời gian bạn vừa chọn đã ở trong quá khứ!');
      return;
    }

    try {
      setSavingSlot(true);

      await partnerSlotService.createSingleSlot({
        doctorId: parseInt(singleFormData.doctorId),
        appointmentDate: singleFormData.appointmentDate,
        startTime: timeStr,
        endTime: singleFormData.endTime.length === 5 ? `${singleFormData.endTime}:00` : singleFormData.endTime,
        roomName: singleFormData.roomName,
      });

      setSuccess('Tạo ca khám tương lai thành công (US-10)!');
      setIsSingleModalOpen(false);
      setModalError(null);
      fetchSlots();
    } catch (err) {
      console.error('Failed to create slot', err);
      const msg = err.message || err.response?.data?.message || '';
      if (msg.includes('overlap') || msg.includes('3004') || err.code === 3004) {
        setModalError('⚠️ LỖI CHỒNG LẤN LỊCH (OVERLAPS): Khung giờ khám này của Bác sĩ đã bị trùng lấn với một ca khám sẵn có! Vui lòng chọn khung giờ khác');
      } else {
        setModalError(`Tạo ca khám thất bại: ${msg || 'Không thể tạo slot mới.'}`);
      }
    } finally {
      setSavingSlot(false);
    }
  };

  // Handle batch slots creation with Future Date validation + Overlap Error Notice
  const handleCreateBatchSlots = async (e) => {
    e.preventDefault();
    setModalError(null);
    setError(null);
    setSuccess(null);

    // Validate future date (US-10 constraint)
    const dateSelected = new Date(batchFormData.appointmentDate);
    const todayZero = new Date();
    todayZero.setHours(0, 0, 0, 0);

    if (dateSelected < todayZero) {
      setModalError('⚠️ Ngày khám phải ở trong tương lai hoặc hôm nay (US-10). Không được chọn ngày trong quá khứ!');
      return;
    }

    try {
      setSavingSlot(true);

      const generatedSlots = [];
      const startH = parseInt(batchFormData.startHour);
      const endH = parseInt(batchFormData.endHour);
      const step = parseInt(batchFormData.durationMinutes);
      const now = new Date();

      for (let h = startH; h < endH; h++) {
        for (let m = 0; m < 60; m += step) {
          const startMin = m < 10 ? `0${m}` : `${m}`;
          const startHourStr = h < 10 ? `0${h}` : `${h}`;

          let nextM = m + step;
          let nextH = h;
          if (nextM >= 60) {
            nextM -= 60;
            nextH += 1;
          }
          const endMin = nextM < 10 ? `0${nextM}` : `${nextM}`;
          const endHourStr = nextH < 10 ? `0${nextH}` : `${nextH}`;

          if (nextH > endH || (nextH === endH && nextM > 0)) break;

          const startTimeStr = `${startHourStr}:${startMin}:00`;
          const slotDateTime = new Date(`${batchFormData.appointmentDate}T${startTimeStr}`);

          // Skip past time slots in batch if creating for today
          if (slotDateTime <= now) {
            continue;
          }

          generatedSlots.push({
            doctorId: parseInt(batchFormData.doctorId),
            appointmentDate: batchFormData.appointmentDate,
            startTime: startTimeStr,
            endTime: `${endHourStr}:${endMin}:00`,
            roomName: batchFormData.roomName,
          });
        }
      }

      if (generatedSlots.length === 0) {
        setModalError('Không tạo được ca khám tương lai nào trong khoảng giờ đã chọn (tất cả khung giờ đều thuộc quá khứ).');
        setSavingSlot(false);
        return;
      }

      await partnerSlotService.createBatchSlots({ slots: generatedSlots });
      setSuccess(`Tạo thành công ${generatedSlots.length} ca khám tương lai hàng loạt!`);
      setIsBatchModalOpen(false);
      setModalError(null);
      fetchSlots();
    } catch (err) {
      console.error('Failed to create batch slots', err);
      const msg = err.message || err.response?.data?.message || '';
      if (msg.includes('overlap') || msg.includes('3004') || err.code === 3004) {
        setModalError('⚠️ LỖI CHỒNG LẤN LỊCH (OVERLAPS): Khung giờ trong batch tạo trùng lấn với lịch khám hiện có của bác sĩ');
      } else {
        setModalError(`Tạo batch slot thất bại: ${msg}`);
      }
    } finally {
      setSavingSlot(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">Quản lý Ca khám & Lịch làm việc</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Thiết lập ca khám tương lai cho bác sĩ, kiểm tra chống trùng lịch (overlaps), tạo thủ công hoặc Import Excel.
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsExcelModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-semibold shadow-md shadow-emerald-600/20 transition"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Import Lịch bằng Excel</span>
          </button>

          <button
            onClick={() => { setModalError(null); setIsBatchModalOpen(true); }}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-cyan-700 text-sm font-semibold border border-slate-200 shadow-sm transition"
          >
            <Layers className="w-4 h-4" />
            <span>Tạo Slot Hàng loạt</span>
          </button>

          <button
            onClick={() => { setModalError(null); setIsSingleModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-sm font-semibold shadow-md shadow-cyan-600/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm 1 Slot</span>
          </button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-start gap-3 shadow-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
          <div className="text-sm font-medium">{error}</div>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-start gap-3 shadow-sm">
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-600" />
          <div className="text-sm font-medium">{success}</div>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Chọn Bác sĩ</label>
          <select
            value={selectedDoctorId}
            onChange={(e) => setSelectedDoctorId(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-slate-800 text-sm focus:outline-none focus:border-cyan-600 focus:bg-white"
          >
            <option value="">Tất cả Bác sĩ</option>
            {doctors.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.title ? `${doc.title} ` : ''}{doc.fullName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Ngày khám</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-slate-800 text-sm focus:outline-none focus:border-cyan-600 focus:bg-white"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Trạng thái Slot</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-slate-800 text-sm focus:outline-none focus:border-cyan-600 focus:bg-white"
          >
            <option value="">Tất cả Trạng thái</option>
            <option value="AVAILABLE">AVAILABLE (Khả dụng)</option>
            <option value="HELD">HELD (Đang giữ chỗ)</option>
            <option value="BOOKED">BOOKED (Đã được đặt)</option>
            <option value="OVER_DATE">OVER_DATE (Quá hạn / Quá ngày)</option>
          </select>
        </div>

        {/* <div className="flex items-end">
          <button
            onClick={fetchSlots}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Tải lại dữ liệu</span>
          </button>
        </div> */}
      </div>

      {/* Slot List */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-500">
          <RefreshCw className="w-6 h-6 animate-spin mr-3 text-cyan-600" />
          <span>Đang tải danh sách ca khám...</span>
        </div>
      ) : slots.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3 shadow-sm">
          <CalendarClock className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-base font-semibold text-slate-800">Chưa có ca khám nào</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Không tìm thấy ca khám khả dụng theo điều kiện lọc. Vui lòng bấm tạo slot tương lai hoặc Import lịch từ file Excel.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {slots.map((slot) => (
            <div
              key={slot.id}
              className="bg-white border border-slate-200 hover:border-cyan-500 rounded-2xl p-5 shadow-sm hover:shadow-md transition space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-cyan-600" />
                  <span className="text-sm font-bold text-slate-900 font-mono">
                    {slot.startTime} - {slot.endTime}
                  </span>
                </div>

                <span
                  className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${slot.status === 'AVAILABLE'
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

              <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
                <div className="flex items-center justify-between text-slate-700">
                  <span className="text-slate-500 flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-slate-400" /> Bác sĩ:
                  </span>
                  <span className="font-semibold text-slate-900">{slot.doctorName || `Doctor #${slot.doctorId}`}</span>
                </div>

                <div className="flex items-center justify-between text-slate-700">
                  <span className="text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" /> Ngày khám:
                  </span>
                  <span className="font-mono font-semibold text-cyan-700">{slot.appointmentDate}</span>
                </div>

                <div className="flex items-center justify-between text-slate-700">
                  <span className="text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> Phòng khám:
                  </span>
                  <span className="font-medium text-slate-800">{slot.roomName || 'Phòng khám'}</span>
                </div>
              </div>

              <div className="pt-2 text-[10px] font-mono text-slate-400 text-right">Slot ID: #{slot.id}</div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Single Slot */}
      {isSingleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-cyan-600" /> Tạo Ca khám Đơn lẻ (Tương lai)
              </h3>
              <button onClick={() => setIsSingleModalOpen(false)} className="text-slate-400 hover:text-slate-600">
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

            <form onSubmit={handleCreateSingleSlot} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Chọn Bác sĩ <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={singleFormData.doctorId}
                  onChange={(e) => setSingleFormData((prev) => ({ ...prev, doctorId: e.target.value }))}
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
                  value={singleFormData.appointmentDate}
                  onChange={(e) => setSingleFormData((prev) => ({ ...prev, appointmentDate: e.target.value }))}
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
                    value={singleFormData.startTime}
                    onChange={(e) => setSingleFormData((prev) => ({ ...prev, startTime: e.target.value }))}
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
                    value={singleFormData.endTime}
                    onChange={(e) => setSingleFormData((prev) => ({ ...prev, endTime: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-sm focus:bg-white focus:border-cyan-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tên phòng khám / Vị trí</label>
                <input
                  type="text"
                  value={singleFormData.roomName}
                  onChange={(e) => setSingleFormData((prev) => ({ ...prev, roomName: e.target.value }))}
                  placeholder="Phòng 301 - Tầng 3"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-sm focus:bg-white focus:border-cyan-600"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsSingleModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={savingSlot}
                  className="px-5 py-2 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-xl shadow-md transition disabled:opacity-50"
                >
                  {savingSlot ? 'Đang kiểm tra & tạo...' : 'Tạo Slot Khám'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Batch Slots */}
      {isBatchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-cyan-600" /> Tạo Ca khám Hàng loạt (Batch Slots)
              </h3>
              <button onClick={() => setIsBatchModalOpen(false)} className="text-slate-400 hover:text-slate-600">
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

            <form onSubmit={handleCreateBatchSlots} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Chọn Bác sĩ *</label>
                <select
                  required
                  value={batchFormData.doctorId}
                  onChange={(e) => setBatchFormData((prev) => ({ ...prev, doctorId: e.target.value }))}
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
                  value={batchFormData.appointmentDate}
                  onChange={(e) => setBatchFormData((prev) => ({ ...prev, appointmentDate: e.target.value }))}
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
                    value={batchFormData.startHour}
                    onChange={(e) => setBatchFormData((prev) => ({ ...prev, startHour: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Đến giờ (Hour)</label>
                  <input
                    type="number"
                    min="7"
                    max="22"
                    value={batchFormData.endHour}
                    onChange={(e) => setBatchFormData((prev) => ({ ...prev, endHour: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Thời lượng (Phút)</label>
                  <select
                    value={batchFormData.durationMinutes}
                    onChange={(e) => setBatchFormData((prev) => ({ ...prev, durationMinutes: e.target.value }))}
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phòng khám</label>
                <input
                  type="text"
                  value={batchFormData.roomName}
                  onChange={(e) => setBatchFormData((prev) => ({ ...prev, roomName: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-sm"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsBatchModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={savingSlot}
                  className="px-5 py-2 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-xl shadow-md transition disabled:opacity-50"
                >
                  {savingSlot ? 'Đang tự động sinh ca...' : 'Xác nhận tạo hàng loạt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Excel Import Modal */}
      <ExcelImportModal
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
        onSuccess={() => fetchSlots()}
      />
    </div>
  );
};
