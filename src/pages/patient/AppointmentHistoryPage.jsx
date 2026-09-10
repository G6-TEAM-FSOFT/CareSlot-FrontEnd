import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Building,
  User,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  FileText,
  CreditCard,
  Activity,
  Pill,
  Receipt,
  ExternalLink,
  Sparkles,
  Stethoscope,
  Eye,
  ShieldCheck
} from 'lucide-react';
import { appointmentService } from '../../services/clinicService';
import { outpatientService } from '../../services/outpatientService';
import { patientService } from '../../services/patientService';
import { PaymentModal } from '../../components/payment/PaymentModal';
import { Link, useNavigate } from 'react-router-dom';

export const AppointmentHistoryPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' | 'history'
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Completed Visit History Tab states
  const [completedVisits, setCompletedVisits] = useState([]);
  const [loadingHistoryVisits, setLoadingHistoryVisits] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState('ALL');
  const [patientProfiles, setPatientProfiles] = useState([]);
  const [expandedVisitId, setExpandedVisitId] = useState(null);
  const [visitHistorySubTab, setVisitHistorySubTab] = useState('overview'); // 'overview' | 'vitals' | 'diagnostics' | 'prescription'

  // Expanded Journey drawer state
  const [expandedAptId, setExpandedAptId] = useState(null);
  const [visitDetails, setVisitDetails] = useState({}); // aptId -> visit data
  const [loadingVisitId, setLoadingVisitId] = useState(null);
  const [visitErrors, setVisitErrors] = useState({});
  const [activeDrawerTab, setActiveDrawerTab] = useState('timeline'); // 'timeline' | 'clinical' | 'diagnostics' | 'prescription' | 'invoices'

  // Payment Modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAppointment, setPaymentAppointment] = useState(null);

  // Cancel Modal state
  const [cancellingAppointment, setCancellingAppointment] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelSubmitting, setCancelSubmitting] = useState(false);
  const [cancelError, setCancelError] = useState('');
  const [cancelSuccess, setCancelSuccess] = useState('');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchCompletedVisits = async () => {
    setLoadingHistoryVisits(true);
    try {
      // 1. Fetch user's patient profiles
      const profilesRes = await patientService.getPatients().catch(() => null);
      let pList = Array.isArray(profilesRes?.data) ? profilesRes.data : (Array.isArray(profilesRes) ? profilesRes : []);
      setPatientProfiles(pList);

      // 2. Fetch history for each profile ID
      let profileIds = pList.map(p => p.id);
      if (profileIds.length === 0) profileIds = [1];

      const historyPromises = profileIds.map(id => outpatientService.getPatientHistory(id).catch(() => null));
      const results = await Promise.all(historyPromises);

      let allVisits = [];
      results.forEach(res => {
        if (res && res.data) {
          const list = Array.isArray(res.data) ? res.data : [];
          allVisits = [...allVisits, ...list];
        }
      });

      // Deduplicate by visit ID
      const uniqueVisitsMap = new Map();
      allVisits.forEach(v => uniqueVisitsMap.set(v.id, v));

      const sortedVisits = Array.from(uniqueVisitsMap.values()).sort((a, b) => {
        const tA = a.completedAt ? new Date(a.completedAt).getTime() : (a.checkedInAt ? new Date(a.checkedInAt).getTime() : 0);
        const tB = b.completedAt ? new Date(b.completedAt).getTime() : (b.checkedInAt ? new Date(b.checkedInAt).getTime() : 0);
        return tB - tA;
      });

      setCompletedVisits(sortedVisits);
    } catch (err) {
      console.error('Lỗi lấy lịch sử đợt khám:', err);
    } finally {
      setLoadingHistoryVisits(false);
    }
  };

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await appointmentService.getAppointments();
      const resData = res?.data || res || [];
      const list = Array.isArray(resData) ? resData : resData.content || [];
      setAppointments(list);
    } catch (err) {
      console.error('Error fetching appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleJourney = async (aptId, e) => {
    if (e) e.stopPropagation();

    if (expandedAptId === aptId) {
      setExpandedAptId(null);
      return;
    }

    setExpandedAptId(aptId);
    setActiveDrawerTab('timeline');

    if (!visitDetails[aptId]) {
      setLoadingVisitId(aptId);
      setVisitErrors(prev => ({ ...prev, [aptId]: null }));
      try {
        const res = await outpatientService.getVisitByAppointmentId(aptId);
        const data = res?.data || res;
        if (data && (data.id || data.visitCode)) {
          setVisitDetails(prev => ({ ...prev, [aptId]: data }));
        } else {
          setVisitErrors(prev => ({
            ...prev,
            [aptId]: 'Chưa có dữ liệu đợt khám. Vui lòng Check-in tại quầy tiếp nhận tại cơ sở khám.'
          }));
        }
      } catch (err) {
        console.error('Error fetching visit detail:', err);
        setVisitErrors(prev => ({
          ...prev,
          [aptId]: 'Bệnh nhân chưa Check-in tại quầy tiếp nhận. Hành trình khám bệnh sẽ xuất hiện tự động sau khi được Lễ tân check-in!'
        }));
      } finally {
        setLoadingVisitId(null);
      }
    }
  };

  const handleOpenCancelModal = (apt) => {
    setCancellingAppointment(apt);
    setCancelReason('Muốn đặt lại lịch sang ngày khác');
    setCancelError('');
    setCancelSuccess('');
  };

  const handleCancelAppointment = async (e) => {
    e.preventDefault();
    if (!cancellingAppointment) return;

    setCancelSubmitting(true);
    setCancelError('');

    try {
      await appointmentService.cancelAppointment(cancellingAppointment.id, { reason: cancelReason });
      setCancelSuccess('Hủy lịch hẹn thành công!');
      setAppointments(appointments.map(a => a.id === cancellingAppointment.id ? { ...a, status: 'CANCELLED' } : a));
      setCancellingAppointment(null);
    } catch (err) {
      console.error('Cancel error:', err);
      setAppointments(appointments.map(a => a.id === cancellingAppointment.id ? { ...a, status: 'CANCELLED' } : a));
      setCancellingAppointment(null);
    } finally {
      setCancelSubmitting(false);
    }
  };

  const isPastStartTime = (apt) => {
    if (!apt || !apt.appointmentDate || !apt.startTime) return false;
    try {
      let dateStr = apt.appointmentDate;
      if (Array.isArray(dateStr)) {
        const [y, m, d] = dateStr;
        dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      }
      let timeStr = apt.startTime;
      if (Array.isArray(timeStr)) {
        const [h, min] = timeStr;
        timeStr = `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}:00`;
      }
      const appointmentStart = new Date(`${dateStr}T${timeStr}`);
      return Date.now() >= appointmentStart.getTime();
    } catch (e) {
      return false;
    }
  };

  const isAppointmentExpired = (apt) => {
    if (!apt) return false;
    if (apt.status === 'EXPIRED') return true;

    if (apt.status === 'PENDING_PAYMENT') {
      if (apt.createdAt) {
        let createdTime = null;
        if (Array.isArray(apt.createdAt)) {
          const [y, m, d, h, min, s] = apt.createdAt;
          createdTime = new Date(y, m - 1, d, h || 0, min || 0, s || 0).getTime();
        } else {
          createdTime = new Date(apt.createdAt).getTime();
        }
        if (createdTime && !isNaN(createdTime)) {
          const elapsedSeconds = Math.floor((Date.now() - createdTime) / 1000);
          return elapsedSeconds >= 600; // 10 minutes timeout
        }
      }
    }
    return false;
  };

  const getStatusBadge = (apt) => {
    if (isAppointmentExpired(apt)) {
      return (
        <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200 tracking-wide uppercase flex items-center gap-1">
          <AlertCircle className="w-3 h-3 text-rose-500" />
          <span>HẾT HẠN THANH TOÁN</span>
        </span>
      );
    }

    const status = typeof apt === 'string' ? apt : apt?.status;
    switch (status) {
      case 'PENDING_PAYMENT':
        return (
          <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 tracking-wide uppercase flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-500 animate-pulse" />
            <span>CHỜ THANH TOÁN</span>
          </span>
        );
      case 'EXPIRED':
        return (
          <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200 tracking-wide uppercase flex items-center gap-1">
            <AlertCircle className="w-3 h-3 text-rose-500" />
            <span>HẾT HẠN THANH TOÁN</span>
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="text-xs font-bold text-rose-600 tracking-wide uppercase">
            ĐÃ HỦY
          </span>
        );
      case 'REJECTED':
        return (
          <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200 tracking-wide uppercase">
            VẮNG MẶT / QUÁ GIỜ KHÁM
          </span>
        );
      case 'OVER_DATE':
        return (
          <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200 tracking-wide uppercase">
            QUÁ HẠN CA KHÁM
          </span>
        );
      case 'CHECKED_IN':
        return (
          <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200 tracking-wide uppercase flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping" />
            <span>ĐÃ CHECK-IN</span>
          </span>
        );
      case 'CONFIRMED':
        return (
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 tracking-wide uppercase">
            ĐÃ XÁC NHẬN
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-200 tracking-wide uppercase flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-sky-600" />
            <span>ĐÃ KHÁM XONG</span>
          </span>
        );
      default:
        return (
          <span className="text-xs font-bold text-slate-500 tracking-wide uppercase">
            {status || 'ĐANG XỬ LÝ'}
          </span>
        );
    }
  };

  const renderJourneyDetails = (apt) => {
    const isFetching = loadingVisitId === apt.id;
    const errorMsg = visitErrors[apt.id];
    const visit = visitDetails[apt.id];

    if (isFetching) {
      return (
        <div className="mt-4 p-6 bg-white text-slate-800 rounded-2xl border border-slate-200 flex items-center justify-center gap-3 shadow-xs">
          <RefreshCw className="w-5 h-5 text-sky-600 animate-spin" />
          <span className="text-xs text-slate-600 font-medium">Đang tải tiến trình hành trình khám bệnh...</span>
        </div>
      );
    }

    if (errorMsg || !visit) {
      return (
        <div className="mt-4 p-5 bg-amber-50/60 border border-amber-200 rounded-2xl text-slate-800 space-y-3 shadow-xs">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wide">Chưa Có Thông Tin Tiến Trình Khám</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {errorMsg || 'Lịch hẹn đã được đăng ký thành công. Vui lòng đến quầy Lễ tân tại cơ sở để Check-in tiếp nhận.'}
              </p>
            </div>
          </div>
          <div className="pt-3 border-t border-amber-200/60 flex items-center justify-between text-xs">
            <span className="text-slate-500">Mã đặt lịch: <strong className="text-sky-700 font-mono">{apt.bookingCode}</strong></span>
            <Link
              to={`/outpatient/journey/appointment/${apt.id}`}
              className="text-sky-700 hover:text-sky-800 flex items-center gap-1 font-bold transition"
            >
              <span>Trang Live Tracker toàn màn hình</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className="mt-4 bg-slate-50 text-slate-800 rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm space-y-5">
        {/* Top Visit Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-extrabold text-sky-700 tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-sky-600" /> MÃ VISIT: {visit.visitCode}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                visit.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse'
              }`}>
                {visit.status === 'COMPLETED' ? 'ĐÃ HOÀN TẤT' : 'ĐANG KHÁM'}
              </span>
            </div>
            <div className="text-xs text-slate-600">
              BS Phụ trách: <strong className="text-emerald-700">{visit.primaryDoctorName}</strong> • {visit.clinicName}
            </div>
          </div>

          <Link
            to={`/outpatient/journey/appointment/${apt.id}`}
            className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs rounded-xl transition shadow-xs flex items-center gap-1.5 shrink-0"
          >
            <span>Live Tracker Toàn Màn Hình</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-200 pb-2 text-xs">
          {[
            { id: 'timeline', label: 'Tiến Trình Realtime', icon: Clock },
            { id: 'clinical', label: 'Lâm Sàng & Sinh Tồn', icon: FileText },
            { id: 'diagnostics', label: 'Kết Quả Cận Lâm Sàng', icon: Activity },
            { id: 'prescription', label: 'Đơn Thuốc Điện Tử', icon: Pill },
            { id: 'invoices', label: 'Hóa Đơn & Thanh Toán', icon: Receipt },
          ].map(t => {
            const Icon = t.icon;
            const active = activeDrawerTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveDrawerTab(t.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition ${
                  active ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Drawer Content: Timeline */}
        {activeDrawerTab === 'timeline' && (
          <div className="space-y-4 text-xs">
            <h4 className="font-extrabold text-slate-800 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-sky-600" />
              <span>Tiến trình 4 bước khám ngoại trú khép kín:</span>
            </h4>

            <div className="relative border-l-2 border-slate-200 ml-3 pl-5 space-y-4">
              {/* Step 1 */}
              <div className="relative">
                <div className="absolute -left-[27px] top-0 w-5 h-5 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center text-[10px]">
                  ✓
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">1. Check-in & Cấp Đợt Khám</span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">Hoàn thành</span>
                  </div>
                  <div className="text-[11px] text-slate-600 mt-1">Mã đợt khám: <span className="text-sky-700 font-mono font-bold">{visit.visitCode}</span></div>
                </div>
              </div>

              {/* Step 2: Encounters */}
              {visit.encounters && visit.encounters.map((enc, idx) => (
                <div key={enc.id} className="relative">
                  <div className={`absolute -left-[27px] top-0 w-5 h-5 rounded-full font-bold flex items-center justify-center text-[10px] ${
                    enc.status === 'COMPLETED' ? 'bg-emerald-500 text-white' :
                    enc.status === 'IN_PROGRESS' ? 'bg-amber-400 text-slate-950 animate-pulse' :
                    'bg-slate-300 text-slate-700'
                  }`}>
                    {enc.status === 'COMPLETED' ? '✓' : idx + 2}
                  </div>
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">
                        {enc.encounterType === 'INITIAL_CONSULTATION' ? '2. Khám Lâm Sàng Lần ĐẦU' : `Khám Đọc Kết Quả (Vòng ${idx})`}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        enc.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        enc.status === 'IN_PROGRESS' ? 'bg-amber-50 text-amber-800 border-amber-200 animate-pulse' :
                        'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {enc.status === 'COMPLETED' ? 'Đã hoàn thành' : enc.status === 'IN_PROGRESS' ? 'Đang khám' : 'Chờ khám'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      <div>Phòng: <strong className="text-sky-700">{enc.roomName} ({enc.roomNumber})</strong></div>
                      <div>Bác sĩ: <strong className="text-slate-900">{enc.doctorName}</strong></div>
                      <div>Số STT: <strong className="text-amber-600 font-mono">{enc.queueNumber}</strong></div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Step 3: Orders */}
              {visit.clinicalOrders && visit.clinicalOrders.map(order => (
                <div key={order.id} className="relative">
                  <div className={`absolute -left-[27px] top-0 w-5 h-5 rounded-full font-bold flex items-center justify-center text-[10px] ${
                    order.status === 'COMPLETED' ? 'bg-emerald-500 text-white' : 'bg-amber-400 text-slate-950 animate-pulse'
                  }`}>
                    CLS
                  </div>
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">3. Chỉ Định Cận Lâm Sàng (Lệnh {order.orderCode})</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        order.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}>
                        {order.status === 'COMPLETED' ? 'Đủ kết quả' : 'Đang thực hiện'}
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      {order.serviceRequests && order.serviceRequests.map(sr => (
                        <div key={sr.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-200 text-[11px]">
                          <div>
                            <div className="font-bold text-slate-800">{sr.serviceName}</div>
                            <div className="text-[10px] text-slate-500">Phòng: {sr.task ? `${sr.task.roomName} (${sr.task.roomNumber})` : 'Chờ phân phòng'}</div>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            sr.result ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            sr.task && sr.task.status === 'READY' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                            'bg-amber-50 text-amber-800 border-amber-200'
                          }`}>
                            {sr.result ? '✅ KQ FINAL' : sr.task && sr.task.status === 'READY' ? '🟡 Đang làm' : '🔒 Chờ thanh toán'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}

              {/* Step 4: Disposition */}
              {visit.disposition && (
                <div className="relative">
                  <div className="absolute -left-[27px] top-0 w-5 h-5 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center text-[10px]">
                    ✓
                  </div>
                  <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl text-xs space-y-1">
                    <div className="font-bold text-emerald-800">4. Kết Luận & Kết Cục Đợt Khám ({visit.disposition.dispositionType})</div>
                    <div className="text-[11px] text-slate-700">{visit.disposition.notes || 'Điều trị ngoại trú theo đơn thuốc.'}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Drawer Content: Clinical Notes */}
        {activeDrawerTab === 'clinical' && (
          <div className="space-y-4 text-xs">
            {visit.vitalSigns && visit.vitalSigns.length > 0 && (
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
                <h4 className="font-bold text-slate-600 uppercase tracking-wider text-[11px]">Chỉ Số Sinh Tồn (Vital Signs)</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {visit.vitalSigns.map(v => (
                    <React.Fragment key={v.id}>
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                        <div className="text-[10px] text-slate-500">Huyết áp</div>
                        <div className="text-sm font-bold text-sky-700">{v.systolicBp}/{v.diastolicBp} mmHg</div>
                      </div>
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                        <div className="text-[10px] text-slate-500">Mạch</div>
                        <div className="text-sm font-bold text-sky-700">{v.heartRateBpm} bpm</div>
                      </div>
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                        <div className="text-[10px] text-slate-500">Nhiệt độ</div>
                        <div className="text-sm font-bold text-sky-700">{v.temperatureC} °C</div>
                      </div>
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                        <div className="text-[10px] text-slate-500">SpO2</div>
                        <div className="text-sm font-bold text-sky-700">{v.spo2}%</div>
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}

            {visit.clinicalNotes && visit.clinicalNotes.length > 0 ? (
              visit.clinicalNotes.map(n => (
                <div key={n.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Trợ lý nhập: <strong className="text-slate-800">{n.enteredByName}</strong></span>
                    <span>BS Chuyên môn: <strong className="text-emerald-700">{n.clinicalAuthorName}</strong></span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg text-slate-800 font-mono text-[11px] whitespace-pre-wrap border border-slate-200">
                    {n.formData}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-slate-500 text-center py-4 text-xs">Chưa ghi nhận thông tin ghi chú lâm sàng.</div>
            )}
          </div>
        )}

        {/* Drawer Content: Diagnostics */}
        {activeDrawerTab === 'diagnostics' && (
          <div className="space-y-3 text-xs">
            {visit.clinicalOrders && visit.clinicalOrders.flatMap(o => o.serviceRequests).filter(sr => sr.result).length > 0 ? (
              visit.clinicalOrders.flatMap(o => o.serviceRequests).filter(sr => sr.result).map(sr => (
                <div key={sr.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <div>
                      <h4 className="font-bold text-slate-900">{sr.serviceName}</h4>
                      <span className="text-[10px] text-slate-500">Loại: {sr.serviceType}</span>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold rounded">
                      FINAL
                    </span>
                  </div>
                  {sr.result.findings && (
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase font-bold">Mô tả / Thao tác:</div>
                      <div className="bg-slate-50 p-2.5 rounded-lg text-slate-800 font-mono text-[11px] border border-slate-200">{sr.result.findings}</div>
                    </div>
                  )}
                  {sr.result.conclusion && (
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase font-bold">Kết luận:</div>
                      <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg text-emerald-900 font-bold">{sr.result.conclusion}</div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-slate-500 text-center py-6 text-xs">Chưa có kết quả cận lâm sàng chính thức (FINAL).</div>
            )}
          </div>
        )}

        {/* Drawer Content: Prescription */}
        {activeDrawerTab === 'prescription' && (
          <div className="space-y-3 text-xs">
            {visit.prescription ? (
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                  <div>
                    <div className="text-xs text-slate-500">Mã đơn thuốc: <span className="text-sky-700 font-mono font-bold">{visit.prescription.prescriptionCode}</span></div>
                    <div className="text-xs font-bold text-slate-900 mt-0.5">Bác sĩ kê đơn: {visit.prescription.prescribedByName}</div>
                    {visit.prescription.diagnosisNote && (
                      <div className="text-[11px] text-emerald-700 font-semibold mt-1">Chẩn đoán: {visit.prescription.diagnosisNote}</div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-500 uppercase font-bold">Ước tính tiền thuốc:</div>
                    <div className="text-base font-extrabold text-amber-600">
                      {visit.prescription.totalEstimatedCost ? visit.prescription.totalEstimatedCost.toLocaleString('vi-VN') : 0} VNĐ
                    </div>
                  </div>
                </div>

                <div className="divide-y divide-slate-200 bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
                  {visit.prescription.items && visit.prescription.items.map((item, i) => (
                    <div key={item.id} className="p-3 flex items-center justify-between text-xs">
                      <div className="space-y-0.5">
                        <div className="font-bold text-slate-900">{i + 1}. {item.drugName} <span className="text-[10px] text-slate-500">({item.dosage})</span></div>
                        <div className="text-emerald-700 text-[11px]">HD: {item.usageInstruction}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-slate-800">x{item.quantity} {item.unit}</div>
                        <div className="text-[10px] text-slate-500">{item.amount ? item.amount.toLocaleString('vi-VN') : 0} VNĐ</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-slate-500 text-center py-6 text-xs">Chưa có đơn thuốc điện tử.</div>
            )}
          </div>
        )}

        {/* Drawer Content: Invoices */}
        {activeDrawerTab === 'invoices' && (
          <div className="space-y-3 text-xs">
            {visit.invoices && visit.invoices.length > 0 ? (
              <div className="space-y-2">
                {visit.invoices.map(inv => (
                  <div key={inv.id} className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900 flex items-center gap-2">
                        <span>{inv.invoiceCode}</span>
                        <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-semibold border border-slate-200">
                          {inv.invoiceType === 'APPOINTMENT_DEPOSIT' ? 'Hóa đơn Cọc' :
                           inv.invoiceType === 'CLINICAL_SERVICE' ? 'Hóa đơn Cận Lâm Sàng' : inv.invoiceType}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Thanh toán: <strong className="text-slate-800">{inv.paidAt ? new Date(inv.paidAt).toLocaleString('vi-VN') : 'Chưa ghi nhận'}</strong>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-extrabold text-amber-600 text-sm">
                        {inv.totalAmount ? inv.totalAmount.toLocaleString('vi-VN') : 0} VNĐ
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        inv.status === 'PAID' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}>
                        {inv.status === 'PAID' ? 'ĐÃ THANH TOÁN' : 'CHỜ THANH TOÁN'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-slate-500 text-center py-6 text-xs">Chưa có thông tin hóa đơn nào trong đợt khám.</div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-slate-50 min-h-screen pt-6 pb-12 font-sans">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">

        {/* Breadcrumb */}
        <div className="text-xs text-slate-400 mb-4 flex items-center gap-1 font-medium">
          <Link to="/" className="hover:text-sky-600 transition">Trang chủ</Link>
          <span>/</span>
          <span className="text-sky-700 font-semibold">Lịch khám & Hành trình</span>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">

          {/* Tabs Navigation */}
          <div className="border-b border-slate-200 grid grid-cols-2 text-center text-xs sm:text-sm font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('upcoming')}
              className={`pb-3 transition relative flex items-center justify-center gap-2 ${activeTab === 'upcoming'
                ? 'text-sky-700 border-b-2 border-sky-600 font-extrabold'
                : 'text-slate-500 hover:text-slate-800'
                }`}
            >
              <Calendar className="w-4 h-4 text-sky-600" />
              <span>Lịch Đặt Khám & Tiến Trình Realtime</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('history');
                fetchCompletedVisits();
              }}
              className={`pb-3 transition relative flex items-center justify-center gap-2 ${activeTab === 'history'
                ? 'text-sky-700 border-b-2 border-sky-600 font-extrabold'
                : 'text-slate-500 hover:text-slate-800'
                }`}
            >
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>Lịch Sử Đợt Khám (Visit History Chi Tiết)</span>
            </button>
          </div>

          {/* TAB 1: UPCOMING & ACTIVE JOURNEY LIST */}
          {activeTab === 'upcoming' && (
            <>
              {loading ? (
                <div className="py-16 text-center text-xs text-slate-400">
                  Đang tải danh sách lịch khám...
                </div>
              ) : appointments.length === 0 ? (
                <div className="py-16 text-center space-y-3">
                  <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="text-xs text-slate-400">Bạn chưa có lịch hẹn khám nào.</p>
                  <Link
                    to="/clinics"
                    className="inline-block px-4 py-2 bg-sky-600 text-white font-bold rounded-xl text-xs shadow-sm hover:bg-sky-700 transition"
                  >
                    Đặt lịch khám ngay
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {appointments.map((apt) => {
                    const dateObj = apt.appointmentDate ? new Date(apt.appointmentDate) : new Date();
                    const dayNum = String(dateObj.getDate()).padStart(2, '0');
                    const monthYear = `${String(dateObj.getMonth() + 1).padStart(2, '0')}/${dateObj.getFullYear()}`;
                    const timeStr = apt.startTime ? apt.startTime.substring(0, 5) : '08:30';
                    const isExpanded = expandedAptId === apt.id;

                    return (
                      <div key={apt.id} className="flex flex-col">
                        <div
                          onClick={(e) => handleToggleJourney(apt.id, e)}
                          className={`bg-white border rounded-2xl p-4 sm:p-5 transition shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer ${
                            isExpanded ? 'border-sky-500 ring-2 ring-sky-500/20 shadow-md' : 'border-slate-200 hover:border-sky-300'
                          }`}
                        >
                          {/* Left Side: Date Block & Main Details */}
                          <div className="flex items-center space-x-4 flex-1">
                            {/* Date Badge Box */}
                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-sky-50 rounded-2xl border border-sky-100 flex flex-col items-center justify-center shrink-0">
                              <span className="text-lg sm:text-2xl font-black text-sky-800 leading-none">
                                {dayNum}
                              </span>
                              <span className="text-[10px] font-bold text-sky-600 leading-tight">
                                {monthYear}
                              </span>
                              <span className="text-[10px] font-extrabold text-slate-600 leading-tight">
                                {timeStr}
                              </span>
                            </div>

                            {/* Main Information */}
                            <div className="space-y-1">
                              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 uppercase">
                                {apt.patientProfile?.fullName || apt.patientName || 'BỆNH NHÂN'}
                              </h3>
                              <p className="text-xs text-slate-600 font-medium">
                                {apt.slot?.doctor?.clinic?.name || apt.clinicName || 'CareSlot Medical Center'}
                              </p>
                              <p className="text-xs text-slate-400">
                                {apt.slot?.doctor?.specialty?.name || apt.specialtyName || 'Khám Chuyên Khoa'}
                              </p>
                            </div>
                          </div>

                          {/* Right Side: Status & Actions */}
                          <div className="flex flex-wrap items-center justify-between sm:justify-end w-full sm:w-auto gap-2 border-t sm:border-t-0 border-slate-100 pt-3 sm:pt-0">
                            {getStatusBadge(apt)}

                            {apt.status === 'PENDING_PAYMENT' && !isAppointmentExpired(apt) && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPaymentAppointment(apt);
                                  setShowPaymentModal(true);
                                }}
                                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-1"
                              >
                                <CreditCard className="w-3.5 h-3.5" />
                                <span>Thanh toán</span>
                              </button>
                            )}

                            {apt.status === 'CONFIRMED' && (
                              isPastStartTime(apt) ? (
                                <span
                                  className="px-3 py-1.5 bg-slate-100 text-slate-400 text-xs font-semibold rounded-xl border border-slate-200 cursor-not-allowed"
                                  title="Lịch hẹn đã đến/qua giờ khám, không thể hủy"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  Quá giờ hủy
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenCancelModal(apt);
                                  }}
                                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-xl border border-rose-200 transition"
                                >
                                  Hủy lịch
                                </button>
                              )
                            )}

                            {/* Action Button: Toggle Journey Details */}
                            <button
                              type="button"
                              onClick={(e) => handleToggleJourney(apt.id, e)}
                              className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition flex items-center gap-1.5 ${
                                isExpanded
                                  ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
                              }`}
                            >
                              <Activity className="w-3.5 h-3.5 text-sky-500" />
                              <span>{isExpanded ? 'Thu gọn' : 'Hành trình khám'}</span>
                              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>

                        {/* Inline Expanded Drawer for Journey Tracker */}
                        {isExpanded && renderJourneyDetails(apt)}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* TAB 2: COMPLETED VISIT MEDICAL HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-6">
              
              {/* Patient Profile Filter Bar if multiple profiles exist */}
              {patientProfiles.length > 1 && (
                <div className="flex flex-wrap items-center gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs">
                  <span className="font-bold text-slate-600 px-2 uppercase tracking-wider">Hồ sơ bệnh nhân:</span>
                  <button
                    type="button"
                    onClick={() => setSelectedProfileId('ALL')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition ${selectedProfileId === 'ALL' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'}`}
                  >
                    Tất cả ({completedVisits.length})
                  </button>
                  {patientProfiles.map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedProfileId(p.id)}
                      className={`px-3 py-1.5 rounded-xl font-bold transition ${selectedProfileId === p.id ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'}`}
                    >
                      {p.fullName} ({p.relationship || 'Bản thân'})
                    </button>
                  ))}
                </div>
              )}

              {loadingHistoryVisits ? (
                <div className="py-16 text-center text-xs text-slate-500 space-y-2">
                  <RefreshCw className="w-5 h-5 animate-spin text-sky-600 mx-auto" />
                  <p className="font-semibold text-slate-600">Đang tải lịch sử các đợt khám bệnh (Visit History)...</p>
                </div>
              ) : completedVisits.filter(v => selectedProfileId === 'ALL' || v.patientProfileId === selectedProfileId).length > 0 ? (
                <div className="space-y-4">
                  {completedVisits
                    .filter(v => selectedProfileId === 'ALL' || v.patientProfileId === selectedProfileId)
                    .map(visit => {
                      const isExpanded = expandedVisitId === visit.id;
                      const visitDate = visit.completedAt
                        ? new Date(visit.completedAt).toLocaleDateString('vi-VN')
                        : (visit.checkedInAt ? new Date(visit.checkedInAt).toLocaleDateString('vi-VN') : 'N/A');

                      return (
                        <div key={visit.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm transition hover:border-sky-300">
                          {/* Visit Summary Card Header */}
                          <div
                            onClick={() => setExpandedVisitId(isExpanded ? null : visit.id)}
                            className="p-5 flex flex-wrap items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/80 transition"
                          >
                            <div className="flex items-center space-x-4">
                              <div className="w-14 h-14 bg-emerald-50 rounded-2xl border border-emerald-200 flex flex-col items-center justify-center shrink-0">
                                <Stethoscope className="w-6 h-6 text-emerald-600" />
                                <span className="text-[10px] font-bold text-emerald-800 font-mono mt-0.5">VISIT</span>
                              </div>

                              <div className="space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h3 className="text-base font-extrabold text-slate-900">{visit.patientName || 'Bệnh nhân'}</h3>
                                  <span className="text-xs font-mono font-bold text-cyan-800 bg-cyan-50 border border-cyan-200 px-2 py-0.5 rounded-md">
                                    {visit.visitCode}
                                  </span>
                                </div>
                                <div className="text-xs text-slate-600">
                                  Bác sĩ: <strong className="text-emerald-700 font-semibold">{visit.primaryDoctorName || 'BS. Chuyên Khoa'}</strong> • Cơ sở: <span className="text-slate-800">{visit.clinicName}</span>
                                </div>
                                <div className="text-xs text-slate-500 font-mono">
                                  Ngày hoàn tất đợt khám: <strong className="text-slate-800">{visitDate}</strong>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 font-extrabold text-xs rounded-xl flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                COMPLETED
                              </span>
                              <button
                                type="button"
                                className="px-3 py-1.5 text-xs font-bold bg-slate-100 text-slate-800 rounded-xl border border-slate-200 hover:bg-slate-200 transition flex items-center gap-1"
                              >
                                <span>{isExpanded ? 'Thu gọn' : 'Xem Hồ Sơ Bệnh'}</span>
                                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>

                          {/* Expanded Medical Record Drawer */}
                          {isExpanded && (
                            <div className="bg-slate-50 text-slate-800 p-6 border-t border-slate-200 space-y-6 animate-fadeIn">
                              
                              {/* Drawer Sub-tabs */}
                              <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3 text-xs">
                                <button
                                  type="button"
                                  onClick={() => setVisitHistorySubTab('overview')}
                                  className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${visitHistorySubTab === 'overview' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'}`}
                                >
                                  <FileText className="w-3.5 h-3.5" />
                                  <span>Tổng Quan & Chẩn Đoán</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setVisitHistorySubTab('vitals')}
                                  className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${visitHistorySubTab === 'vitals' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'}`}
                                >
                                  <Activity className="w-3.5 h-3.5" />
                                  <span>Chỉ Số Sinh Tồn ({visit.vitalSigns?.length || 0})</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setVisitHistorySubTab('diagnostics')}
                                  className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${visitHistorySubTab === 'diagnostics' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'}`}
                                >
                                  <ShieldCheck className="w-3.5 h-3.5" />
                                  <span>Cận Lâm Sàng & Kết Quả ({visit.clinicalOrders?.flatMap(o => o.serviceRequests || []).length || 0})</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setVisitHistorySubTab('prescription')}
                                  className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${visitHistorySubTab === 'prescription' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'}`}
                                >
                                  <Pill className="w-3.5 h-3.5" />
                                  <span>Đơn Thuốc Điện Tử</span>
                                </button>
                              </div>

                              {/* Sub-tab 1: Overview */}
                              {visitHistorySubTab === 'overview' && (
                                <div className="space-y-4 text-xs">
                                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
                                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Thông Tin Đợt Khám & Bác Sĩ Chuyên Khoa:</div>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-800">
                                      <div>Mã đợt khám: <strong className="text-sky-700 font-mono block">{visit.visitCode}</strong></div>
                                      <div>Mã lịch hẹn: <strong className="text-slate-900 font-mono block">{visit.bookingCode || 'N/A'}</strong></div>
                                      <div>Bác sĩ chính: <strong className="text-emerald-700 block">{visit.primaryDoctorName}</strong></div>
                                      <div>Cơ sở khám: <strong className="text-slate-700 block">{visit.clinicName}</strong></div>
                                    </div>
                                  </div>

                                  {visit.disposition && (
                                    <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 space-y-1.5">
                                      <div className="text-xs font-extrabold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                        <span>Kết Cục Khám Bệnh ({visit.disposition.dispositionType}):</span>
                                      </div>
                                      <p className="text-slate-800 text-xs leading-relaxed font-medium">
                                        "{visit.disposition.notes || 'Bệnh nhân điều trị ngoại trú theo đơn thuốc.'}"
                                      </p>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Sub-tab 2: Vitals */}
                              {visitHistorySubTab === 'vitals' && (
                                <div className="space-y-3 text-xs">
                                  {visit.vitalSigns && visit.vitalSigns.length > 0 ? (
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                      {visit.vitalSigns.map(v => (
                                        <React.Fragment key={v.id}>
                                          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                                            <div className="text-[10px] text-slate-500">Huyết áp</div>
                                            <div className="text-sm font-black text-sky-700 font-mono">{v.systolicBp}/{v.diastolicBp} mmHg</div>
                                          </div>
                                          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                                            <div className="text-[10px] text-slate-500">Mạch tim</div>
                                            <div className="text-sm font-black text-sky-700 font-mono">{v.heartRateBpm} bpm</div>
                                          </div>
                                          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                                            <div className="text-[10px] text-slate-500">Nhiệt độ</div>
                                            <div className="text-sm font-black text-sky-700 font-mono">{v.temperatureC} °C</div>
                                          </div>
                                          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                                            <div className="text-[10px] text-slate-500">SpO2</div>
                                            <div className="text-sm font-black text-sky-700 font-mono">{v.spo2}%</div>
                                          </div>
                                        </React.Fragment>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="text-slate-500 text-center py-4">Chưa có thông tin chỉ số sinh tồn.</div>
                                  )}
                                </div>
                              )}

                              {/* Sub-tab 3: Diagnostics */}
                              {visitHistorySubTab === 'diagnostics' && (
                                <div className="space-y-3 text-xs">
                                  {visit.clinicalOrders && visit.clinicalOrders.flatMap(o => o.serviceRequests || []).length > 0 ? (
                                    visit.clinicalOrders.flatMap(o => o.serviceRequests || []).map(sr => (
                                      <div key={sr.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
                                        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                                          <div className="font-bold text-slate-900 text-sm">{sr.serviceName}</div>
                                          <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold rounded">
                                            {sr.result ? '✅ ĐÃ CÓ KẾT QUẢ' : 'CHỜ KẾT QUẢ'}
                                          </span>
                                        </div>
                                        {sr.result && (
                                          <div className="space-y-2 pt-1">
                                            {sr.result.findings && (
                                              <div>
                                                <span className="text-[10px] text-slate-500 font-bold uppercase">Mô tả / Thao tác kỹ thuật:</span>
                                                <p className="bg-slate-50 p-2.5 rounded-lg text-slate-800 font-mono text-[11px] border border-slate-200 mt-0.5">
                                                  {sr.result.findings}
                                                </p>
                                              </div>
                                            )}
                                            {sr.result.conclusion && (
                                              <div>
                                                <span className="text-[10px] text-slate-500 font-bold uppercase">Kết luận cận lâm sàng:</span>
                                                <p className="bg-emerald-50 p-2.5 rounded-lg text-emerald-900 font-bold border border-emerald-200 mt-0.5">
                                                  {sr.result.conclusion}
                                                </p>
                                              </div>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    ))
                                  ) : (
                                    <div className="text-slate-500 text-center py-4">Chưa có kết quả cận lâm sàng.</div>
                                  )}
                                </div>
                              )}

                              {/* Sub-tab 4: Prescription */}
                              {visitHistorySubTab === 'prescription' && (
                                <div className="space-y-3 text-xs">
                                  {visit.prescription ? (
                                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-4">
                                      <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                                        <div>
                                          <div className="text-xs text-slate-500">Mã đơn thuốc: <span className="text-sky-700 font-mono font-bold">{visit.prescription.prescriptionCode}</span></div>
                                          <div className="text-xs font-bold text-slate-900 mt-0.5">BS Kê đơn: {visit.prescription.prescribedByName}</div>
                                          {visit.prescription.diagnosisNote && (
                                            <div className="text-[11px] text-emerald-700 font-semibold mt-1">Chẩn đoán: {visit.prescription.diagnosisNote}</div>
                                          )}
                                        </div>
                                        <div className="text-right">
                                          <div className="text-[10px] text-slate-500 uppercase font-bold">Ước tính tiền thuốc:</div>
                                          <div className="text-base font-extrabold text-amber-600 font-mono">
                                            {visit.prescription.totalEstimatedCost ? visit.prescription.totalEstimatedCost.toLocaleString('vi-VN') : 0} VNĐ
                                          </div>
                                        </div>
                                      </div>

                                      <div className="divide-y divide-slate-200 bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
                                        {visit.prescription.items && visit.prescription.items.map((item, i) => (
                                          <div key={item.id} className="p-3 flex items-center justify-between text-xs">
                                            <div className="space-y-0.5">
                                              <div className="font-bold text-slate-900">{i + 1}. {item.drugName} <span className="text-[10px] text-slate-500">({item.dosage})</span></div>
                                              <div className="text-emerald-700 text-[11px]">Hướng dẫn: {item.usageInstruction}</div>
                                            </div>
                                            <div className="text-right">
                                              <div className="font-bold text-slate-800 font-mono">x{item.quantity} {item.unit}</div>
                                              <div className="text-[10px] text-slate-500 font-mono">{item.amount ? item.amount.toLocaleString('vi-VN') : 0} VNĐ</div>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="text-slate-500 text-center py-4">Chưa có đơn thuốc điện tử.</div>
                                  )}
                                </div>
                              )}

                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-12 text-center text-slate-500 space-y-3">
                  <Stethoscope className="w-10 h-10 text-slate-400 mx-auto" />
                  <p className="text-sm font-semibold text-slate-600">Chưa tìm thấy đợt khám (VISIT) nào đã hoàn tất cho hồ sơ này.</p>
                  <p className="text-xs text-slate-400">Sau khi hoàn thành tất cả các bước khám bệnh tại cơ sở y tế, lịch sử đợt khám chi tiết sẽ hiển thị tại đây.</p>
                </div>
              )}

            </div>
          )}

        </div>
      </div>


      {/* ================= CANCEL APPOINTMENT MODAL ================= */}
      {cancellingAppointment && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Xác nhận Hủy Lịch Khám
            </h3>

            <p className="text-xs text-slate-600">
              Bạn đang hủy lịch hẹn của bệnh nhân <strong className="text-slate-900">{cancellingAppointment.patientName}</strong> vào ngày{' '}
              <strong className="text-slate-900">{cancellingAppointment.appointmentDate}</strong>.
            </p>

            <form onSubmit={handleCancelAppointment} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">Lý do hủy lịch:</label>
                <textarea
                  required
                  rows={3}
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Nhập lý do bạn muốn hủy..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCancellingAppointment(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Bỏ qua
                </button>
                <button
                  type="submit"
                  disabled={cancelSubmitting}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm transition"
                >
                  {cancelSubmitting ? 'Đang gửi...' : 'Xác nhận Hủy'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        appointment={paymentAppointment}
      />
    </div>
  );
};
