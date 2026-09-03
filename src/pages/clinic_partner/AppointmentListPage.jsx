import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, Search, RefreshCw, AlertCircle, Eye, Calendar, User, Stethoscope, DollarSign, Clock } from 'lucide-react';
import { partnerAppointmentService } from '../../services/clinic_partner/partnerAppointmentService';
import { DEFAULT_DEPOSIT_AMOUNT } from '../../config/constants';

export const AppointmentListPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedStatus, setSelectedStatus] = useState('');
  const [keyword, setKeyword] = useState('');

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {};
      if (selectedStatus) params.status = selectedStatus;

      const res = await partnerAppointmentService.getAppointments(params);
      const data = res.data?.content || res.data || res;
      setAppointments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch clinic appointments', err);
      setError(err.message || 'Không thể tải danh sách lịch hẹn của phòng khám.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, [selectedStatus]);

  const filteredAppointments = appointments.filter(
    (apt) =>
      !keyword ||
      apt.bookingCode?.toLowerCase().includes(keyword.toLowerCase()) ||
      apt.patientName?.toLowerCase().includes(keyword.toLowerCase()) ||
      apt.doctorName?.toLowerCase().includes(keyword.toLowerCase())
  );

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'CHECKED_IN':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      case 'CANCELLED':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'PENDING_PAYMENT':
      case 'HELD':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-xs font-mono font-bold rounded-full bg-cyan-100 text-cyan-700 border border-cyan-200">
              US-12 & US-11
            </span>
            <h1 className="text-2xl font-bold text-slate-900">Tra cứu Lịch hẹn Phòng khám</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Danh sách lịch hẹn bệnh nhân đã xác nhận, kiểm tra số tiền cọc (Deposit) và xem lịch sử truy vết booking.
          </p>
        </div>

        <button
          onClick={loadAppointments}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-slate-900 text-xs font-semibold hover:bg-slate-100 transition shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Làm mới</span>
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-start gap-3 shadow-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
          <div className="text-sm font-medium">{error}</div>
        </div>
      )}

      {/* Filters Toolbar */}
      <div className="flex flex-col md:flex-row items-center gap-4 bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
        <div className="w-full md:w-1/2 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Tìm theo Mã booking (CS...), Tên bệnh nhân hoặc Bác sĩ..."
            className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2 text-slate-900 text-sm focus:outline-none focus:border-cyan-600 focus:bg-white"
          />
        </div>

        <div className="w-full md:w-1/3">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-slate-900 text-sm focus:outline-none focus:border-cyan-600 focus:bg-white"
          >
            <option value="">Tất cả Trạng thái</option>
            <option value="CONFIRMED">CONFIRMED (Đã xác nhận)</option>
            <option value="CHECKED_IN">CHECKED_IN (Đã đến khám)</option>
            <option value="PENDING_PAYMENT">PENDING_PAYMENT (Chờ thanh toán cọc)</option>
            <option value="CANCELLED">CANCELLED (Đã hủy)</option>
          </select>
        </div>
      </div>

      {/* Appointments Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-500">
          <RefreshCw className="w-6 h-6 animate-spin mr-3 text-cyan-600" />
          <span>Đang tải danh sách lịch hẹn...</span>
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3 shadow-sm">
          <ClipboardList className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-base font-semibold text-slate-800">Không có lịch hẹn nào</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Hiện tại phòng khám chưa có cuộc hẹn khám phù hợp với tiêu chí lọc của bạn.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-100 text-slate-700 text-xs uppercase font-mono font-bold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Mã Booking</th>
                  <th className="px-6 py-4">Bệnh nhân</th>
                  <th className="px-6 py-4">Bác sĩ & Chuyên khoa</th>
                  <th className="px-6 py-4">Ngày & Giờ khám</th>
                  <th className="px-6 py-4 text-right">Tiền cọc (US-11)</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredAppointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-slate-50/80 transition">
                    {/* Booking Code */}
                    <td className="px-6 py-4 font-mono text-cyan-700 font-bold">
                      {apt.bookingCode || `CS-${apt.id}`}
                    </td>

                    {/* Patient Name */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-slate-400" />
                        <span className="font-semibold text-slate-900">{apt.patientName || 'Bệnh nhân'}</span>
                      </div>
                    </td>

                    {/* Doctor & Specialty */}
                    <td className="px-6 py-4">
                      <div className="space-y-0.5">
                        <div className="font-semibold text-slate-800">{apt.doctorName || 'N/A'}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-1">
                          <Stethoscope className="w-3 h-3 text-cyan-600" />
                          <span>{apt.specialtyName || 'Chuyên khoa'}</span>
                        </div>
                      </div>
                    </td>

                    {/* Appointment Date & Time */}
                    <td className="px-6 py-4">
                      <div className="space-y-0.5 text-xs">
                        <div className="font-mono text-slate-800 flex items-center gap-1 font-semibold">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{apt.appointmentDate || 'N/A'}</span>
                        </div>
                        <div className="font-mono text-cyan-700 flex items-center gap-1 font-medium">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{apt.startTime ? `${apt.startTime} - ${apt.endTime || ''}` : 'Ca khám'}</span>
                        </div>
                      </div>
                    </td>

                    {/* Deposit Amount (US-11) */}
                    <td className="px-6 py-4 text-right">
                      <div className="font-bold text-emerald-700 font-mono">
                        {formatCurrency(apt.depositAmount || DEFAULT_DEPOSIT_AMOUNT)}
                      </div>
                      <div className="text-[10px] text-slate-500">Mặc định: 100k VNĐ</div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span
                        className={`text-[11px] font-mono font-semibold px-2.5 py-1 rounded-full border ${getStatusBadge(
                          apt.status
                        )}`}
                      >
                        {apt.status || 'CONFIRMED'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-center">
                      <Link
                        to={`/clinic-partner/appointments/${apt.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-cyan-700 hover:text-cyan-800 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-200 transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Timeline Log</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
