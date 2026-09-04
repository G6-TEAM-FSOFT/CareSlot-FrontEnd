import React, { useState, useEffect } from 'react';
import { Building2, Save, MapPin, Phone, FileText, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { partnerClinicService } from '../../services/clinic_partner/partnerClinicService';

export const ClinicProfilePage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [formData, setFormData] = useState({
    id: null,
    name: '',
    address: '',
    latitude: '',
    longitude: '',
    phone: '',
    description: '',
    status: 'ACTIVE',
  });

  const fetchClinicProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await partnerClinicService.getClinicProfile();
      const data = res.data || res;
      setFormData({
        id: data.id || '',
        name: data.name || '',
        address: data.address || '',
        latitude: data.latitude || '',
        longitude: data.longitude || '',
        phone: data.phone || '',
        description: data.description || '',
        status: data.status || 'ACTIVE',
      });
      if (data.id) {
        localStorage.setItem('care_slot_clinic_id', data.id);
      }
    } catch (err) {
      console.error('Failed to load clinic profile', err);
      setError(err.message || 'Không thể tải thông tin phòng khám. Vui lòng kiểm tra quyền truy cập.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClinicProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const payload = {
        name: formData.name,
        address: formData.address,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        phone: formData.phone,
        description: formData.description,
        status: formData.status,
      };

      const res = await partnerClinicService.updateClinicProfile(payload);
      setSuccess('Cập nhật thông tin phòng khám thành công (US-05)!');
      if (res.data) {
        setFormData((prev) => ({ ...prev, ...res.data }));
      }
    } catch (err) {
      console.error('Failed to update clinic profile', err);
      setError(err.message || 'Cập nhật thông tin thất bại. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-500">
        <RefreshCw className="w-6 h-6 animate-spin mr-3 text-cyan-600" />
        <span>Đang tải thông tin phòng khám...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Title */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">Quản lý Thông tin Phòng khám</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Cập nhật tên, địa chỉ, số điện thoại, mô tả và trạng thái hoạt động của cơ sở y tế.
          </p>
        </div>

        {/* <button
          onClick={fetchClinicProfile}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Làm mới</span>
        </button> */}
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

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Clinic ID (Readonly) */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">Mã Phòng khám (Clinic ID)</label>
            <input
              type="text"
              value={formData.id || 'Chưa gán'}
              disabled
              className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-500 text-sm font-mono cursor-not-allowed"
            />
          </div>

          {/* Clinic Status */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">Trạng thái Hoạt động</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 text-sm focus:outline-none focus:border-cyan-600 focus:bg-white transition"
            >
              <option value="ACTIVE">ACTIVE (Đang hoạt động)</option>
              <option value="INACTIVE">INACTIVE (Ngừng hoạt động)</option>
            </select>
          </div>

          {/* Name */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-600 mb-2">
              Tên Phòng khám / Bệnh viện <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Building2 className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Nhập tên chính thức của cơ sở khám chữa bệnh"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-11 pr-4 py-2.5 text-slate-900 text-sm focus:outline-none focus:border-cyan-600 focus:bg-white transition"
              />
            </div>
          </div>

          {/* Address */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-600 mb-2">
              Địa chỉ Chi tiết <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <MapPin className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                name="address"
                required
                value={formData.address}
                onChange={handleChange}
                placeholder="Số nhà, Tên đường, Phường/Xã, Quận/Huyện, Tỉnh/Thành phố"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-11 pr-4 py-2.5 text-slate-900 text-sm focus:outline-none focus:border-cyan-600 focus:bg-white transition"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">Số Điện thoại Liên hệ</label>
            <div className="relative">
              <Phone className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="1900xxxx hoặc 024xxxxxxxx"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-11 pr-4 py-2.5 text-slate-900 text-sm focus:outline-none focus:border-cyan-600 focus:bg-white transition"
              />
            </div>
          </div>

          {/* Coordinates (Latitude / Longitude) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">Vĩ độ (Latitude)</label>
              <input
                type="number"
                step="any"
                name="latitude"
                value={formData.latitude || ''}
                onChange={handleChange}
                placeholder="VD: 21.0031"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-900 text-sm focus:outline-none focus:border-cyan-600 focus:bg-white transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">Kinh độ (Longitude)</label>
              <input
                type="number"
                step="any"
                name="longitude"
                value={formData.longitude || ''}
                onChange={handleChange}
                placeholder="VD: 105.8286"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-900 text-sm focus:outline-none focus:border-cyan-600 focus:bg-white transition"
              />
            </div>
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-600 mb-2">Mô tả Phòng khám</label>
            <div className="relative">
              <FileText className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
              <textarea
                name="description"
                rows="4"
                value={formData.description}
                onChange={handleChange}
                placeholder="Giới thiệu về thế mạnh, cơ sở vật chất, trang thiết bị y tế..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-11 pr-4 py-2.5 text-slate-900 text-sm focus:outline-none focus:border-cyan-600 focus:bg-white transition"
              ></textarea>
            </div>
          </div>
        </div>

        {/* Submit button */}
        <div className="pt-4 border-t border-slate-200 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold shadow-md shadow-cyan-600/20 transition duration-200 disabled:opacity-50"
          >
            {saving ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Đang lưu...</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>Lưu thông tin phòng khám</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
