import React, { useState, useEffect } from 'react';
import { X, UserCheck, RefreshCw, DollarSign, Image } from 'lucide-react';
import { partnerSpecialtyService } from '../../services/clinic_partner/partnerSpecialtyService';

export const DoctorFormModal = ({ isOpen, onClose, onSubmit, initialData = null, isSaving = false }) => {
  const [specialties, setSpecialties] = useState([]);
  const [formData, setFormData] = useState({
    specialtyId: '',
    fullName: '',
    title: 'BS',
    bio: '',
    avatarUrl: '',
    consultationFee: 500000,
    status: 'ACTIVE',
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      partnerSpecialtyService
        .getClinicSpecialties()
        .then((res) => {
          const list = res.data || res;
          setSpecialties(Array.isArray(list) ? list : []);
        })
        .catch((err) => console.error('Failed to load clinic specialties', err));
    }
  }, [isOpen]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        specialtyId: initialData.specialtyId || initialData.specialty?.id || '',
        fullName: initialData.fullName || '',
        title: initialData.title || 'BS',
        bio: initialData.bio || '',
        avatarUrl: initialData.avatarUrl || '',
        consultationFee: initialData.consultationFee || 500000,
        status: initialData.status || 'ACTIVE',
      });
    } else {
      setFormData({
        specialtyId: '',
        fullName: '',
        title: 'BS',
        bio: '',
        avatarUrl: '',
        consultationFee: 500000,
        status: 'ACTIVE',
      });
    }
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.fullName.trim()) {
      setError('Vui lòng nhập họ tên bác sĩ');
      return;
    }
    if (!formData.specialtyId) {
      setError('Vui lòng chọn chuyên khoa cho bác sĩ');
      return;
    }
    setError(null);
    onSubmit({
      ...formData,
      consultationFee: parseFloat(formData.consultationFee) || 0,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl shadow-2xl p-6 space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-cyan-600" />
            <h3 className="text-lg font-bold text-slate-900">
              {initialData ? 'Cập nhật Hồ sơ Bác sĩ' : 'Tạo mới Hồ sơ Bác sĩ'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Họ và Tên Bác sĩ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleChange}
                placeholder="VD: Nguyễn Văn An"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 text-sm focus:bg-white focus:border-cyan-600"
              />
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Chức danh / Học hàm</label>
              <select
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 text-sm focus:bg-white focus:border-cyan-600"
              >
                <option value="BS">BS (Bác sĩ)</option>
                <option value="ThS.BS">ThS.BS (Thạc sĩ Bác sĩ)</option>
                <option value="CKI.BS">CKI.BS (Bác sĩ CKI)</option>
                <option value="CKII.BS">CKII.BS (Bác sĩ CKII)</option>
                <option value="TS.BS">TS.BS (Tiến sĩ Bác sĩ)</option>
                <option value="PGS.TS">PGS.TS (Phó Giáo giáo GS.TS)</option>
                <option value="GS.TS.BS">GS.TS.BS (Giáo giáo GS.TS Bác sĩ)</option>
              </select>
            </div>

            {/* Specialty */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Chuyên khoa Khám <span className="text-red-500">*</span>
              </label>
              <select
                name="specialtyId"
                required
                value={formData.specialtyId}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 text-sm focus:bg-white focus:border-cyan-600"
              >
                <option value="">-- Chọn chuyên khoa --</option>
                {specialties.map((sp) => (
                  <option key={sp.id} value={sp.id}>
                    {sp.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Consultation Fee */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Giá khám (VNĐ) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="number"
                  step="10000"
                  min="0"
                  name="consultationFee"
                  required
                  value={formData.consultationFee}
                  onChange={handleChange}
                  placeholder="500000"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3.5 py-2.5 text-slate-900 text-sm focus:bg-white focus:border-cyan-600"
                />
              </div>
            </div>

            {/* Avatar URL */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">URL Ảnh đại diện</label>
              <div className="relative">
                <Image className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  name="avatarUrl"
                  value={formData.avatarUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/doctor-avatar.jpg"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3.5 py-2.5 text-slate-900 text-sm focus:bg-white focus:border-cyan-600"
                />
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Trạng thái Hoạt động</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 text-sm focus:bg-white focus:border-cyan-600"
              >
                <option value="ACTIVE">ACTIVE (Hiển thị khám)</option>
                <option value="INACTIVE">INACTIVE (Ngừng tiếp nhận)</option>
              </select>
            </div>

            {/* Bio */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Mô tả Kinh nghiệm & Tiểu sử</label>
              <textarea
                name="bio"
                rows="3"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Mô tả quá trình học tập, làm việc, kinh nghiệm điều trị..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 text-sm focus:bg-white focus:border-cyan-600"
              ></textarea>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-xl shadow-md transition disabled:opacity-50"
            >
              {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UserCheck className="w-4 h-4" />}
              <span>{initialData ? 'Lưu cập nhật' : 'Tạo bác sĩ mới'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
