import React, { useState, useEffect } from 'react';
import { 
  Building2, Plus, RefreshCw, AlertCircle, CheckCircle2, 
  Search, Calendar, Clock, ShieldAlert
} from 'lucide-react';
import partnerRoomService from '../../services/clinic_partner/partnerRoomService';
import { partnerAppointmentService } from '../../services/clinic_partner/partnerAppointmentService';
import { RoomCard } from '../../components/clinic_partner/RoomCard';
import { RoomFormModal } from '../../components/clinic_partner/RoomFormModal';
import { RoomDetailModal } from '../../components/clinic_partner/RoomDetailModal';

export const RoomManagementPage = () => {
  const [rooms, setRooms] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [selectedRoomType, setSelectedRoomType] = useState('');
  const [selectedSlotFilter, setSelectedSlotFilter] = useState(''); // 'MANY', 'FEW', 'ZERO'

  // Modal State (Create / Edit Room)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Detail Modal State (Room Appointments Detail)
  const [selectedRoomForDetail, setSelectedRoomForDetail] = useState(null);
  const [roomAppointments, setRoomAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [appointmentStatusFilter, setAppointmentStatusFilter] = useState('');

  // Form Fields
  const [formData, setFormData] = useState({
    departmentId: '',
    roomNumber: '',
    name: '',
    roomType: 'CONSULTATION',
    status: 'ACTIVE'
  });

  const roomTypeLabels = {
    CONSULTATION: 'Phòng khám bệnh',
    LAB_COLLECTION: 'Phòng lấy mẫu XN',
    ULTRASOUND: 'Phòng siêu âm',
    XRAY: 'Phòng X-Quang',
    CT: 'Phòng Chụp CT / MRI',
    CASHIER: 'Quầy thu ngân / Đón tiếp'
  };

  const statusBadgeConfig = {
    CONFIRMED: { label: 'Đã xác nhận', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    CHECKED_IN: { label: 'Đã vào khám', bg: 'bg-blue-100 text-blue-800 border-blue-200' },
    COMPLETED: { label: 'Hoàn thành', bg: 'bg-purple-100 text-purple-800 border-purple-200' },
    PENDING_PAYMENT: { label: 'Chờ thanh toán', bg: 'bg-amber-100 text-amber-800 border-amber-200' },
    CANCELLED: { label: 'Đã hủy', bg: 'bg-red-100 text-red-800 border-red-200' },
    REJECTED: { label: 'Từ chối / Quá giờ', bg: 'bg-gray-100 text-gray-800 border-gray-200' }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [deptsRes, roomsRes] = await Promise.all([
        partnerRoomService.getDepartments(),
        partnerRoomService.getRooms()
      ]);

      const deptsList = deptsRes.data || deptsRes || [];
      const roomsList = roomsRes.data || roomsRes || [];

      setDepartments(Array.isArray(deptsList) ? deptsList : []);
      setRooms(Array.isArray(roomsList) ? roomsList : []);
    } catch (err) {
      console.error('Failed to load rooms data', err);
      setError(err.response?.data?.message || err.message || 'Không thể tải danh sách phòng khám.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingRoom(null);
    setFormData({
      departmentId: departments.length > 0 ? departments[0].id : '',
      roomNumber: '',
      name: '',
      roomType: 'CONSULTATION',
      status: 'ACTIVE'
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (room) => {
    setEditingRoom(room);
    setFormData({
      departmentId: room.departmentId || (departments.length > 0 ? departments[0].id : ''),
      roomNumber: room.roomNumber || '',
      name: room.name || '',
      roomType: room.roomType || 'CONSULTATION',
      status: room.status || 'ACTIVE'
    });
    setIsModalOpen(true);
  };

  const handleOpenRoomDetail = async (room) => {
    setSelectedRoomForDetail(room);
    setAppointmentStatusFilter('');
    try {
      setLoadingAppointments(true);
      const res = await partnerAppointmentService.getAppointments({ roomId: room.id, size: 100 });
      const appList = res.data?.content || res.data || res;
      setRoomAppointments(Array.isArray(appList) ? appList : []);
    } catch (err) {
      console.error('Failed to load room appointments', err);
      setRoomAppointments([]);
    } finally {
      setLoadingAppointments(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.departmentId || !formData.roomNumber || !formData.name) {
      setError('Vui lòng điền đầy đủ các thông tin bắt buộc.');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      setSuccess(null);

      const payload = {
        departmentId: Number(formData.departmentId),
        roomNumber: formData.roomNumber.trim(),
        name: formData.name.trim(),
        roomType: formData.roomType,
        status: formData.status
      };

      if (editingRoom) {
        await partnerRoomService.updateRoom(editingRoom.id, payload);
        setSuccess(`Cập nhật phòng "${payload.name}" thành công!`);
      } else {
        await partnerRoomService.createRoom(payload);
        setSuccess(`Thêm mới phòng "${payload.name}" thành công!`);
      }

      setIsModalOpen(false);
      loadData();
    } catch (err) {
      console.error('Failed to save room', err);
      setError(err.response?.data?.message || err.message || 'Lỗi khi lưu phòng khám.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRoom = async (room) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa phòng "${room.name}" (${room.roomNumber})?`)) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      await partnerRoomService.deleteRoom(room.id);
      setSuccess(`Xóa phòng "${room.name}" thành công!`);
      loadData();
    } catch (err) {
      console.error('Failed to delete room', err);
      setError(err.response?.data?.message || err.message || 'Không thể xóa phòng (có thể phòng đang gắn với ca khám).');
      setLoading(false);
    }
  };

  // Filter Logic
  const filteredRooms = rooms.filter(room => {
    const matchesSearch = 
      room.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.roomNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.departmentName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDept = selectedDeptId ? String(room.departmentId) === String(selectedDeptId) : true;
    const matchesType = selectedRoomType ? room.roomType === selectedRoomType : true;

    let matchesSlot = true;
    if (selectedSlotFilter === 'MANY') matchesSlot = (room.totalSlots || 0) >= 8;
    else if (selectedSlotFilter === 'FEW') matchesSlot = (room.totalSlots || 0) > 0 && (room.totalSlots || 0) < 8;
    else if (selectedSlotFilter === 'ZERO') matchesSlot = (room.totalSlots || 0) === 0;

    return matchesSearch && matchesDept && matchesType && matchesSlot;
  });

  // Calculate Metrics Summary
  const totalRoomsCount = rooms.length;
  const roomsWithSlotsCount = rooms.filter(r => (r.totalSlots || 0) > 0).length;
  const roomsZeroSlotsCount = rooms.filter(r => (r.totalSlots || 0) === 0).length;
  const totalSlotsCount = rooms.reduce((acc, r) => acc + (r.totalSlots || 0), 0);
  const totalBookedSlotsCount = rooms.reduce((acc, r) => acc + (r.bookedSlots || 0), 0);

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="w-7 h-7 text-indigo-600" />
            Quản Lý Phòng Khám & Lịch Đã Lên Plan
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Xem danh sách phòng, phân bổ khoa phòng và giám sát số lượng ca khám (slot) đang hoạt động.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-gray-200"
            title="Tải lại dữ liệu"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Tạo Phòng Mới
          </button>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3 animate-fade-in">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500" />
          <span>{success}</span>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Tổng số phòng</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{totalRoomsCount}</p>
            <p className="text-xs text-gray-500 mt-0.5">{departments.length} khoa phòng</p>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Phòng đang có lịch</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{roomsWithSlotsCount}</p>
            <p className="text-xs text-emerald-600 mt-0.5">Đã lên appointment slots</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Phòng chưa có slot</p>
            <p className="text-2xl font-bold text-amber-500 mt-1">{roomsZeroSlotsCount}</p>
            <p className="text-xs text-amber-600 mt-0.5">Cần tạo ca khám cho bác sĩ</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-500 rounded-xl">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Tổng Slot / Đã đặt</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{totalSlotsCount} / {totalBookedSlotsCount}</p>
            <p className="text-xs text-blue-600 mt-0.5">Tỉ lệ đặt: {totalSlotsCount > 0 ? Math.round((totalBookedSlotsCount / totalSlotsCount) * 100) : 0}%</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm theo tên phòng, mã phòng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <select
            value={selectedDeptId}
            onChange={(e) => setSelectedDeptId(e.target.value)}
            className="py-2 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Tất cả khoa phòng</option>
            {departments.map(d => (
              <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
            ))}
          </select>

          <select
            value={selectedRoomType}
            onChange={(e) => setSelectedRoomType(e.target.value)}
            className="py-2 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Tất cả loại phòng</option>
            {Object.entries(roomTypeLabels).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>

          <select
            value={selectedSlotFilter}
            onChange={(e) => setSelectedSlotFilter(e.target.value)}
            className="py-2 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Tất cả trạng thái slot</option>
            <option value="MANY">Nhiều slot (&ge; 8 slots)</option>
            <option value="FEW">Có ít slot (1 - 7 slots)</option>
            <option value="ZERO">Không có slot nào (0 slot)</option>
          </select>
        </div>
      </div>

      {/* Room Cards Grid */}
      {loading ? (
        <div className="py-20 text-center text-gray-500 flex flex-col items-center gap-2">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
          <p>Đang tải dữ liệu phòng khám...</p>
        </div>
      ) : filteredRooms.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-gray-100 p-8 space-y-3">
          <Building2 className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="text-lg font-semibold text-gray-700">Không tìm thấy phòng khám nào</h3>
          <p className="text-sm text-gray-500">Thử thay đổi bộ lọc tìm kiếm hoặc tạo phòng khám mới.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRooms.map(room => (
            <RoomCard
              key={room.id}
              room={room}
              roomTypeLabels={roomTypeLabels}
              onDetail={handleOpenRoomDetail}
              onEdit={handleOpenEditModal}
              onDelete={handleDeleteRoom}
            />
          ))}
        </div>
      )}

      {/* Modal: Create / Edit Room */}
      <RoomFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        formData={formData}
        setFormData={setFormData}
        editingRoom={editingRoom}
        departments={departments}
        roomTypeLabels={roomTypeLabels}
        isSaving={isSaving}
      />

      {/* Modal: Room Appointments Detail */}
      <RoomDetailModal
        selectedRoom={selectedRoomForDetail}
        onClose={() => setSelectedRoomForDetail(null)}
        roomTypeLabels={roomTypeLabels}
        statusBadgeConfig={statusBadgeConfig}
        appointments={roomAppointments}
        loadingAppointments={loadingAppointments}
        appointmentStatusFilter={appointmentStatusFilter}
        setAppointmentStatusFilter={setAppointmentStatusFilter}
      />
    </div>
  );
};

export default RoomManagementPage;
