import React, { useState, useEffect } from 'react';
import { UserCheck, Plus, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { partnerDoctorService } from '../../services/clinic_partner/partnerDoctorService';
import { partnerSpecialtyService } from '../../services/clinic_partner/partnerSpecialtyService';
import { partnerAppointmentService } from '../../services/clinic_partner/partnerAppointmentService';
import { partnerSlotService } from '../../services/clinic_partner/partnerSlotService';
import { DoctorCard } from '../../components/clinic_partner/DoctorCard';
import { DoctorFormModal } from '../../components/clinic_partner/DoctorFormModal';
import { DoctorDetailModal } from '../../components/clinic_partner/DoctorDetailModal';

export const DoctorListPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Modal State (Create / Edit Doctor)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Detail Modal State (Doctor Profile, Slots & Appointments)
  const [selectedDoctorForDetail, setSelectedDoctorForDetail] = useState(null);
  const [doctorAppointments, setDoctorAppointments] = useState([]);
  const [loadingDoctorAppointments, setLoadingDoctorAppointments] = useState(false);
  const [doctorSlots, setDoctorSlots] = useState([]);
  const [loadingDoctorSlots, setLoadingDoctorSlots] = useState(false);
  const [timeFilter, setTimeFilter] = useState('PRESENT_FUTURE'); // 'PRESENT_FUTURE' | 'ALL'
  const [appointmentStatusFilter, setAppointmentStatusFilter] = useState('');

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

      // Load clinic specialties for filter dropdown
      const resSp = await partnerSpecialtyService.getClinicSpecialties();
      const spList = resSp.data || resSp;
      setSpecialties(Array.isArray(spList) ? spList : []);

      // Load partner doctors
      const params = { size: 100 };
      if (selectedSpecialtyId) params.specialtyId = selectedSpecialtyId;
      if (selectedStatus) params.status = selectedStatus;

      const resDoc = await partnerDoctorService.getDoctors(params);
      const docList = resDoc.data?.content || resDoc.data || resDoc;
      setDoctors(Array.isArray(docList) ? docList : []);
    } catch (err) {
      console.error('Failed to load doctors list', err);
      setError(err.message || 'Không thể tải danh sách bác sĩ.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedSpecialtyId, selectedStatus]);

  const loadDoctorAppointments = async (doctor, filterMode = timeFilter) => {
    if (!doctor) return;
    try {
      setLoadingDoctorAppointments(true);
      const todayStr = new Date().toISOString().split('T')[0];
      const params = { doctorId: doctor.id, size: 100 };
      if (filterMode === 'PRESENT_FUTURE') {
        params.fromDate = todayStr;
      }
      const res = await partnerAppointmentService.getAppointments(params);
      const appList = res.data?.content || res.data || res;
      setDoctorAppointments(Array.isArray(appList) ? appList : []);
    } catch (err) {
      console.error('Failed to load doctor appointments', err);
      setDoctorAppointments([]);
    } finally {
      setLoadingDoctorAppointments(false);
    }
  };

  const loadDoctorSlots = async (doctor) => {
    if (!doctor) return;
    try {
      setLoadingDoctorSlots(true);
      const res = await partnerSlotService.getSlots({ doctorId: doctor.id });
      const slotList = res.data || res;
      setDoctorSlots(Array.isArray(slotList) ? slotList : []);
    } catch (err) {
      console.error('Failed to load doctor slots', err);
      setDoctorSlots([]);
    } finally {
      setLoadingDoctorSlots(false);
    }
  };

  const handleOpenDoctorDetail = (doctor) => {
    setSelectedDoctorForDetail(doctor);
    setTimeFilter('PRESENT_FUTURE');
    setAppointmentStatusFilter('');
    loadDoctorAppointments(doctor, 'PRESENT_FUTURE');
    loadDoctorSlots(doctor);
  };

  const handleTimeFilterChange = (newMode) => {
    setTimeFilter(newMode);
    loadDoctorAppointments(selectedDoctorForDetail, newMode);
  };

  const handleOpenCreateModal = () => {
    setEditingDoctor(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (doctor) => {
    setEditingDoctor(doctor);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      setIsSaving(true);
      setError(null);
      setSuccess(null);

      if (editingDoctor) {
        await partnerDoctorService.updateDoctor(editingDoctor.id, formData);
        setSuccess(`Cập nhật thông tin bác sĩ "${formData.fullName}" thành công!`);
      } else {
        await partnerDoctorService.createDoctor(formData);
        setSuccess(`Tạo hồ sơ bác sĩ "${formData.fullName}" thành công!`);
      }

      setIsModalOpen(false);
      loadData();
    } catch (err) {
      console.error('Failed to save doctor', err);
      setError(err.message || 'Lỗi khi lưu thông tin bác sĩ.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async (doctor) => {
    const newStatus = doctor.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const actionText = newStatus === 'ACTIVE' ? 'kích hoạt lại' : 'ngừng hoạt động';

    if (!window.confirm(`Bạn có chắc muốn ${actionText} bác sĩ "${doctor.fullName}"?`)) {
      return;
    }

    try {
      setError(null);
      setSuccess(null);
      await partnerDoctorService.updateDoctorStatus(doctor.id, newStatus);
      setSuccess(`Đã chuyển trạng thái bác sĩ "${doctor.fullName}" sang ${newStatus}!`);
      loadData();
    } catch (err) {
      console.error('Failed to update status', err);
      setError(err.message || 'Chuyển trạng thái thất bại.');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">Quản lý Hồ sơ Bác sĩ</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Thêm, chỉnh sửa thông tin, giá khám và theo dõi lịch hẹn khám của bác sĩ thuộc phòng khám.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-sm font-semibold shadow-md shadow-cyan-600/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Bác sĩ Mới</span>
        </button>
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
      <div className="flex flex-col md:flex-row items-center gap-4 bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
        <div className="w-full md:w-1/3">
          <label className="block text-xs font-semibold text-slate-600 mb-1">Lọc theo Chuyên khoa</label>
          <select
            value={selectedSpecialtyId}
            onChange={(e) => setSelectedSpecialtyId(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-slate-900 text-sm focus:outline-none focus:border-cyan-600"
          >
            <option value="">Tất cả Chuyên khoa</option>
            {specialties.map((sp) => (
              <option key={sp.id} value={sp.id}>
                {sp.name}
              </option>
            ))}
          </select>
        </div>

        <div className="w-full md:w-1/3">
          <label className="block text-xs font-semibold text-slate-600 mb-1">Trạng thái Hoạt động</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-slate-900 text-sm focus:outline-none focus:border-cyan-600"
          >
            <option value="">Tất cả Trạng thái</option>
            <option value="ACTIVE">ACTIVE (Hoạt động)</option>
            <option value="INACTIVE">INACTIVE (Ngừng tiếp nhận)</option>
          </select>
        </div>

        <div className="w-full md:w-auto flex items-end ml-auto">
          <button
            onClick={loadData}
            className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Làm mới</span>
          </button>
        </div>
      </div>

      {/* Doctor Cards Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-500">
          <RefreshCw className="w-6 h-6 animate-spin mr-3 text-cyan-600" />
          <span>Đang tải danh sách bác sĩ...</span>
        </div>
      ) : doctors.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3 shadow-sm">
          <UserCheck className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-base font-semibold text-slate-800">Không tìm thấy bác sĩ nào</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Chưa có bác sĩ phù hợp với bộ lọc tìm kiếm. Hãy thêm bác sĩ mới cho phòng khám của bạn.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doctor) => (
            <DoctorCard
              key={doctor.id}
              doctor={doctor}
              formatCurrency={formatCurrency}
              onDetail={handleOpenDoctorDetail}
              onToggleStatus={handleToggleStatus}
              onEdit={handleOpenEditModal}
            />
          ))}
        </div>
      )}

      {/* Doctor Form Modal */}
      <DoctorFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingDoctor}
        isSaving={isSaving}
      />

      {/* Doctor Detail & Appointments Modal */}
      <DoctorDetailModal
        selectedDoctor={selectedDoctorForDetail}
        onClose={() => setSelectedDoctorForDetail(null)}
        formatCurrency={formatCurrency}
        timeFilter={timeFilter}
        onTimeFilterChange={handleTimeFilterChange}
        statusBadgeConfig={statusBadgeConfig}
        appointments={doctorAppointments}
        loadingAppointments={loadingDoctorAppointments}
        doctorSlots={doctorSlots}
        loadingDoctorSlots={loadingDoctorSlots}
        appointmentStatusFilter={appointmentStatusFilter}
        setAppointmentStatusFilter={setAppointmentStatusFilter}
      />
    </div>
  );
};

export default DoctorListPage;
