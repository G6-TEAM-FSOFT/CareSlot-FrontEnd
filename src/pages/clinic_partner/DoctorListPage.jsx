import React, { useState, useEffect } from 'react';
import { UserCheck, Plus, Edit, RefreshCw, AlertCircle, CheckCircle2, Stethoscope, ToggleLeft, ToggleRight, DollarSign } from 'lucide-react';
import { partnerDoctorService } from '../../services/clinic_partner/partnerDoctorService';
import { partnerSpecialtyService } from '../../services/clinic_partner/partnerSpecialtyService';
import { DoctorFormModal } from './DoctorFormModal';

export const DoctorListPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load clinic specialties for filter dropdown
      const resSp = await partnerSpecialtyService.getClinicSpecialties();
      const spList = resSp.data || resSp;
      setSpecialties(Array.isArray(spList) ? spList : []);

      // Load partner doctors
      const params = {};
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
            Thêm, chỉnh sửa thông tin, giá khám và trạng thái tiếp nhận của bác sĩ thuộc phòng khám.
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
            <div
              key={doctor.id}
              className="bg-white border border-slate-200 hover:border-cyan-500 rounded-2xl p-6 transition duration-200 shadow-sm hover:shadow-md flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Doctor Avatar & Status */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-600 overflow-hidden flex items-center justify-center font-bold text-white shadow-sm">
                      {doctor.avatarUrl ? (
                        <img src={doctor.avatarUrl} alt={doctor.fullName} className="w-full h-full object-cover" />
                      ) : (
                        <span>{doctor.fullName?.charAt(0) || 'D'}</span>
                      )}
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-cyan-700">{doctor.title || 'BS'}</span>
                      <h3 className="text-base font-bold text-slate-900 leading-tight">{doctor.fullName}</h3>
                    </div>
                  </div>

                  <span
                    className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${doctor.status === 'ACTIVE'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-red-50 text-red-700 border-red-200'
                      }`}
                  >
                    {doctor.status || 'ACTIVE'}
                  </span>
                </div>

                {/* Specialty & Fee */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                      <Stethoscope className="w-3.5 h-3.5 text-cyan-600" />
                      Chuyên khoa:
                    </span>
                    <span className="font-semibold text-slate-900">
                      {doctor.specialtyName || doctor.specialty?.name || 'N/A'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                      Giá khám:
                    </span>
                    <span className="font-bold text-emerald-700">
                      {formatCurrency(doctor.consultationFee)}
                    </span>
                  </div>
                </div>

                {/* Bio snippet */}
                {doctor.bio && (
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed italic">
                    "{doctor.bio}"
                  </p>
                )}
              </div>

              {/* Actions Footer */}
              <div className="pt-4 mt-6 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => handleToggleStatus(doctor)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${doctor.status === 'ACTIVE'
                      ? 'text-amber-700 hover:bg-amber-50 border-amber-200'
                      : 'text-emerald-700 hover:bg-emerald-50 border-emerald-200'
                    }`}
                  title="Đổi trạng thái tiếp nhận"
                >
                  {doctor.status === 'ACTIVE' ? (
                    <>
                      <ToggleRight className="w-4 h-4 text-amber-600" />
                      <span>Tắt khám</span>
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="w-4 h-4 text-emerald-600" />
                      <span>Bật khám</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleOpenEditModal(doctor)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-cyan-700 hover:text-cyan-800 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Sửa hồ sơ</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Doctor Modal */}
      <DoctorFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingDoctor}
        isSaving={isSaving}
      />
    </div>
  );
};
