import React, { useState, useEffect } from 'react';
import { Stethoscope, Plus, Trash2, Search, CheckCircle2, AlertCircle, RefreshCw, X, ShieldAlert } from 'lucide-react';
import { partnerSpecialtyService } from '../../services/clinic_partner/partnerSpecialtyService';

export const ClinicSpecialtiesPage = () => {
  const [clinicSpecialties, setClinicSpecialties] = useState([]);
  const [allSystemSpecialties, setAllSystemSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [filterKeyword, setFilterKeyword] = useState('');

  const loadSpecialtiesData = async () => {
    try {
      setLoading(true);
      setError(null);
      const resClinic = await partnerSpecialtyService.getClinicSpecialties();
      const clinicData = resClinic.data || resClinic;
      setClinicSpecialties(Array.isArray(clinicData) ? clinicData : []);

      const resSystem = await partnerSpecialtyService.getAllSystemSpecialties();
      const systemData = resSystem.data?.content || resSystem.data || resSystem;
      setAllSystemSpecialties(Array.isArray(systemData) ? systemData : []);
    } catch (err) {
      console.error('Failed to fetch specialties', err);
      setError(err.message || 'Không thể tải danh sách chuyên khoa.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSpecialtiesData();
  }, []);

  const handleAddSpecialty = async () => {
    if (!selectedSpecialtyId) return;
    try {
      setActionLoading(true);
      setError(null);
      setSuccess(null);

      await partnerSpecialtyService.addSpecialty(selectedSpecialtyId);
      setSuccess('Thêm chuyên khoa vào phòng khám thành công!');
      setIsAddModalOpen(false);
      setSelectedSpecialtyId('');
      loadSpecialtiesData();
    } catch (err) {
      console.error('Failed to add specialty', err);
      setError(err.message || 'Thêm chuyên khoa thất bại.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveSpecialty = async (specialtyId, name) => {
    if (!window.confirm(`Bạn có chắc chắn muốn gỡ chuyên khoa "${name}" khỏi phòng khám?`)) {
      return;
    }
    try {
      setActionLoading(true);
      setError(null);
      setSuccess(null);

      await partnerSpecialtyService.removeSpecialty(specialtyId);
      setSuccess(`Đã gỡ chuyên khoa "${name}" khỏi phòng khám!`);
      loadSpecialtiesData();
    } catch (err) {
      console.error('Failed to remove specialty', err);
      setError(err.message || 'Gỡ chuyên khoa thất bại.');
    } finally {
      setActionLoading(false);
    }
  };

  // Filter existing clinic specialties
  const filteredClinicSpecialties = clinicSpecialties.filter((sp) =>
    sp.name?.toLowerCase().includes(filterKeyword.toLowerCase()) ||
    sp.description?.toLowerCase().includes(filterKeyword.toLowerCase())
  );

  // Available system specialties not yet in clinic
  const availableSystemSpecialties = allSystemSpecialties.filter(
    (sysSp) => !clinicSpecialties.some((clnSp) => clnSp.id === sysSp.id)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">Quản lý Chuyên khoa Phòng khám</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Cấu hình các danh mục chuyên khoa khám chữa bệnh tại phòng khám dành cho bệnh nhân tra cứu.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-sm font-semibold shadow-md shadow-cyan-600/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Chuyên khoa</span>
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

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          value={filterKeyword}
          onChange={(e) => setFilterKeyword(e.target.value)}
          placeholder="Tìm kiếm chuyên khoa đang hoạt động tại phòng khám..."
          className="w-full bg-white border border-slate-300 rounded-xl pl-11 pr-4 py-2.5 text-slate-900 text-sm focus:outline-none focus:border-cyan-600 shadow-sm"
        />
      </div>

      {/* Specialties List */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-500">
          <RefreshCw className="w-6 h-6 animate-spin mr-3 text-cyan-600" />
          <span>Đang tải danh sách chuyên khoa...</span>
        </div>
      ) : filteredClinicSpecialties.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3 shadow-sm">
          <Stethoscope className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-base font-semibold text-slate-800">Chưa có chuyên khoa nào</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Phòng khám của bạn chưa cấu hình chuyên khoa. Vui lòng bấm "Thêm Chuyên khoa" để chọn các dịch vụ từ danh mục hệ thống.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClinicSpecialties.map((specialty) => (
            <div
              key={specialty.id}
              className="bg-white border border-slate-200 hover:border-cyan-500 rounded-2xl p-6 transition duration-200 shadow-sm hover:shadow-md flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-cyan-50 text-cyan-600 border border-cyan-200">
                    <Stethoscope className="w-6 h-6" />
                  </div>
                  <span
                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${specialty.status === 'ACTIVE'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                  >
                    {specialty.status || 'ACTIVE'}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-cyan-600 transition">
                    {specialty.name}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-3 mt-1.5 leading-relaxed">
                    {specialty.description || 'Chưa có mô tả chi tiết cho chuyên khoa này.'}
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-6 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400">ID: #{specialty.id}</span>
                <button
                  onClick={() => handleRemoveSpecialty(specialty.id, specialty.name)}
                  disabled={actionLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg border border-red-200 transition disabled:opacity-50 font-medium"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Gỡ bỏ</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Specialty Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-cyan-600" />
                <h3 className="text-lg font-bold text-slate-900">Thêm Chuyên khoa vào Phòng khám</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-slate-500">
                Chọn một chuyên khoa đang hoạt động trong danh mục hệ thống để gán trực tiếp cho phòng khám:
              </p>

              {availableSystemSpecialties.length === 0 ? (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2 font-medium">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600" />
                  <span>Tất cả chuyên khoa hệ thống đã được thêm vào phòng khám này.</span>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">
                    Danh mục Chuyên khoa Hệ thống
                  </label>
                  <select
                    value={selectedSpecialtyId}
                    onChange={(e) => setSelectedSpecialtyId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-cyan-600 focus:bg-white transition"
                  >
                    <option value="">-- Chọn chuyên khoa --</option>
                    {availableSystemSpecialties.map((sysSp) => (
                      <option key={sysSp.id} value={sysSp.id}>
                        {sysSp.name} (ID: #{sysSp.id})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleAddSpecialty}
                disabled={!selectedSpecialtyId || actionLoading}
                className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-xl shadow-md transition disabled:opacity-50"
              >
                {actionLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                <span>Xác nhận thêm</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
