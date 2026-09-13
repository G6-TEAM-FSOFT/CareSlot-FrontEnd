import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { outpatientService } from '../../services/outpatientService';
import { 
  CheckCircle, Clock, AlertCircle, FileText, Activity, 
  CreditCard, Pill, ArrowLeft, RefreshCw, User, ShieldCheck, ChevronRight, Sparkles
} from 'lucide-react';
import { parseClinicalNote } from '../../utils/formatters';

export default function PatientJourneyTrackerPage() {
  const { visitId, appointmentId } = useParams();
  const navigate = useNavigate();

  const [visit, setVisit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('timeline');

  useEffect(() => {
    fetchVisitData();
  }, [visitId, appointmentId]);

  const fetchVisitData = async () => {
    setLoading(true);
    try {
      let res;
      if (visitId) {
        res = await outpatientService.getVisitDetail(visitId);
      } else if (appointmentId) {
        res = await outpatientService.getVisitByAppointmentId(appointmentId);
      }
      if (res && res.data) {
        setVisit(res.data);
      }
    } catch (err) {
      console.error('Lỗi lấy dữ liệu hành trình khám:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 flex items-center justify-center p-6 font-sans">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-10 h-10 text-sky-600 animate-spin" />
          <p className="text-slate-600 text-sm font-medium">Đang tải hành trình khám bệnh realtime...</p>
        </div>
      </div>
    );
  }

  if (!visit) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 text-center space-y-4 shadow-xl">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900">Chưa tìm thấy Đợt khám</h2>
          <p className="text-slate-600 text-xs leading-relaxed">
            Bệnh nhân chưa được Lễ tân Check-in tại quầy tiếp nhận hoặc ID đợt khám không hợp lệ.
          </p>
          <button 
            onClick={() => navigate(-1)}
            className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 font-bold rounded-xl text-white text-xs transition-all shadow-sm"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Top Header Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 text-xs font-semibold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Quay lại
            </button>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                visit.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                'bg-amber-50 text-amber-800 border-amber-200 animate-pulse'
              }`}>
                {visit.status === 'COMPLETED' ? 'Đã Hoàn Tất Đợt Khám' : 'Đang Thực Hiện Đợt Khám'}
              </span>
              <button 
                onClick={fetchVisitData}
                className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600 transition-colors border border-slate-200"
                title="Cập nhật dữ liệu"
              >
                <RefreshCw className="w-4 h-4 text-sky-600" />
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="text-xs font-mono font-extrabold text-sky-700 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-sky-600" /> Mã Đợt Khám: {visit.visitCode}
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-2">
                {visit.patientName}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                <span className="flex items-center gap-1"><User className="w-3.5 h-3.5 text-slate-500" /> Giới tính: {visit.patientGender === 'MALE' ? 'Nam' : 'Nữ'}</span>
                <span>•</span>
                <span>Ngày sinh: {visit.patientDob || 'N/A'}</span>
                <span>•</span>
                <span>SĐT: <span className="font-mono text-sky-700 font-bold">{visit.patientPhone}</span></span>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex flex-col justify-center gap-2">
              <div className="text-xs text-slate-500 font-medium">Cơ sở khám bệnh:</div>
              <div className="text-sm font-bold text-slate-900">{visit.clinicName}</div>
              <div className="text-xs text-slate-500 font-medium mt-1">Bác sĩ phụ trách:</div>
              <div className="text-sm font-bold text-emerald-700">{visit.primaryDoctorName}</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
          {[
            { id: 'timeline', label: 'Hành Trình Khám Realtime', icon: Clock },
            { id: 'clinical', label: 'Thông Tin Lâm Sàng', icon: FileText },
            { id: 'diagnostics', label: 'Kết Quả Cận Lâm Sàng', icon: Activity },
            { id: 'prescription', label: 'Đơn Thuốc Điện Tử', icon: Pill },
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all ${
                  active 
                    ? 'bg-sky-600 text-white shadow-sm' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content: Timeline */}
        {activeTab === 'timeline' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 space-y-8 shadow-xs">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-sky-600" />
              Tiến Trình Đợt Khám Ngoại Trú Khép Kín
            </h2>

            <div className="relative border-l-2 border-slate-200 ml-4 space-y-8 pl-6">
              
              {/* Step 1: Check-in */}
              <div className="relative">
                <div className="absolute -left-[31px] top-0 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-xs">
                  ✓
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-slate-900 text-base">1. Check-in Tiếp Nhận & Cấp Đợt Khám</h3>
                    <span className="text-xs text-emerald-700 font-bold px-2 py-0.5 bg-emerald-50 border border-emerald-200 rounded-md">Hoàn thành</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Bệnh nhân đã xác minh danh tính và được cấp đợt khám mã <span className="text-sky-700 font-mono font-bold">{visit.visitCode}</span>.
                  </p>
                </div>
              </div>

              {/* Step 2: Encounters */}
              {visit.encounters && visit.encounters.map((enc, idx) => (
                <div key={enc.id} className="relative">
                  <div className={`absolute -left-[31px] top-0 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                    enc.status === 'COMPLETED' ? 'bg-emerald-500 text-white' :
                    enc.status === 'IN_PROGRESS' ? 'bg-amber-400 text-slate-950 animate-pulse' :
                    'bg-slate-300 text-slate-700'
                  }`}>
                    {enc.status === 'COMPLETED' ? '✓' : idx + 2}
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-slate-900 text-base">
                        {enc.encounterType === 'INITIAL_CONSULTATION' ? '2. Khám Lâm Sàng Lần ĐẦU' : `Khám Đọc Kết Quả (Vòng ${idx})`}
                      </h3>
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-md border ${
                        enc.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        enc.status === 'IN_PROGRESS' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                        'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {enc.status === 'COMPLETED' ? 'Hoàn thành' : enc.status === 'IN_PROGRESS' ? 'Đang khám' : 'Đang chờ'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-slate-700 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                      <div>
                        <span className="text-slate-500">Phòng khám:</span> <span className="font-bold text-sky-700">{enc.roomName} ({enc.roomNumber})</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Bác sĩ:</span> <span className="font-bold text-slate-900">{enc.doctorName}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Số thứ tự:</span> <span className="font-mono font-bold text-amber-600">{enc.queueNumber}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Step 3: Orders & Diagnostics */}
              {visit.clinicalOrders && visit.clinicalOrders.map(order => (
                <div key={order.id} className="relative">
                  <div className={`absolute -left-[31px] top-0 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                    order.status === 'COMPLETED' ? 'bg-emerald-500 text-white' : 'bg-amber-400 text-slate-950 animate-pulse'
                  }`}>
                    CLS
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-slate-900 text-base">
                        3. Chỉ Định Cận Lâm Sàng - Vòng {order.orderRound} ({order.orderCode})
                      </h3>
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-md border ${
                        order.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}>
                        {order.status === 'COMPLETED' ? 'Đã có đủ kết quả' : 'Đang thực hiện'}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {order.serviceRequests && order.serviceRequests.map(sr => (
                        <div key={sr.id} className="flex flex-wrap items-center justify-between p-3 bg-white rounded-xl border border-slate-200 shadow-xs gap-2">
                          <div>
                            <div className="font-bold text-slate-900 text-xs">{sr.serviceName}</div>
                            <div className="text-[11px] text-slate-500">Phòng: {sr.task ? `${sr.task.roomName} (${sr.task.roomNumber})` : 'Đang phân phòng'}</div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`text-xs px-2.5 py-1 rounded-lg font-bold border ${
                              sr.result ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                              sr.task && sr.task.status === 'READY' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                              'bg-amber-50 text-amber-800 border-amber-200'
                            }`}>
                              {sr.result ? '✅ Kết quả FINAL' : sr.task && sr.task.status === 'READY' ? '🟡 Đang làm' : '🔒 Chờ thanh toán'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}

              {/* Step 4: Final Disposition */}
              {visit.disposition && (
                <div className="relative">
                  <div className="absolute -left-[31px] top-0 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-xs">
                    ✓
                  </div>
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
                    <h3 className="font-bold text-emerald-800 text-base mb-1">
                      4. Kết Luận & Kết Cục Đợt Khám ({visit.disposition.dispositionType})
                    </h3>
                    <p className="text-xs text-slate-700">{visit.disposition.notes || 'Bệnh nhân điều trị ngoại trú theo đơn thuốc.'}</p>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {/* Tab Content: Clinical Notes */}
        {activeTab === 'clinical' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 space-y-6 shadow-xs">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-4">
              <FileText className="w-5 h-5 text-sky-600" /> Hồ Sơ Khám Lâm Sàng
            </h2>

            {/* Vital Signs */}
            {visit.vitalSigns && visit.vitalSigns.length > 0 && (
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Chỉ Số Sinh Tồn (Vital Signs)</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {visit.vitalSigns.map(v => (
                    <React.Fragment key={v.id}>
                      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                        <div className="text-[10px] text-slate-500 font-bold uppercase">Huyết áp</div>
                        <div className="text-base font-bold text-sky-700">{v.systolicBp}/{v.diastolicBp} <span className="text-xs font-normal text-slate-500">mmHg</span></div>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                        <div className="text-[10px] text-slate-500 font-bold uppercase">Mạch</div>
                        <div className="text-base font-bold text-sky-700">{v.heartRateBpm} <span className="text-xs font-normal text-slate-500">bpm</span></div>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                        <div className="text-[10px] text-slate-500 font-bold uppercase">Nhiệt độ</div>
                        <div className="text-base font-bold text-sky-700">{v.temperatureC} <span className="text-xs font-normal text-slate-500">°C</span></div>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                        <div className="text-[10px] text-slate-500 font-bold uppercase">SpO2</div>
                        <div className="text-base font-bold text-sky-700">{v.spo2}%</div>
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {visit.clinicalNotes && visit.clinicalNotes.map(n => (
              <div key={n.id} className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3">
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Người nhập: <span className="text-slate-900 font-semibold">{n.enteredByName}</span></span>
                  <span>Bác sĩ chuyên môn: <span className="text-emerald-700 font-semibold">{n.clinicalAuthorName}</span></span>
                </div>
                <div className="bg-white p-4 rounded-xl text-xs text-slate-800 font-medium whitespace-pre-wrap border border-slate-200 shadow-xs">
                  {parseClinicalNote(n.formData)}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab Content: Diagnostic Results */}
        {activeTab === 'diagnostics' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 space-y-6 shadow-xs">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-4">
              <Activity className="w-5 h-5 text-sky-600" /> Trả Kết Quả Cận Lâm Sàng
            </h2>

            {visit.clinicalOrders && visit.clinicalOrders.flatMap(o => o.serviceRequests).filter(sr => sr.result).map(sr => (
              <div key={sr.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{sr.serviceName}</h3>
                    <span className="text-xs text-slate-500">Loại: {sr.serviceType}</span>
                  </div>
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-full">
                    STATUS: FINAL
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  {sr.result.findings && (
                    <div>
                      <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">Mô tả / Thao tác kỹ thuật:</div>
                      <div className="bg-white p-3 rounded-xl text-slate-800 font-mono border border-slate-200 shadow-xs">{sr.result.findings}</div>
                    </div>
                  )}
                  {sr.result.conclusion && (
                    <div>
                      <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">Kết luận:</div>
                      <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-emerald-900 font-bold">
                        {sr.result.conclusion}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab Content: Prescription */}
        {activeTab === 'prescription' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 space-y-6 shadow-xs">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-4">
              <Pill className="w-5 h-5 text-sky-600" /> Đơn Thuốc Điện Tử (Electronic Prescription)
            </h2>

            {visit.prescription ? (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
                  <div>
                    <div className="text-xs text-slate-500">Mã đơn thuốc: <span className="text-sky-700 font-mono font-bold">{visit.prescription.prescriptionCode}</span></div>
                    <div className="text-xs font-semibold text-slate-900 mt-0.5">Bác sĩ kê đơn: {visit.prescription.prescribedByName}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-500 uppercase font-bold">Tổng tiền ước tính:</div>
                    <div className="text-lg font-extrabold text-amber-600 font-mono">{visit.prescription.totalEstimatedCost ? visit.prescription.totalEstimatedCost.toLocaleString('vi-VN') : 0} VNĐ</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Danh sách thuốc chỉ định</h4>
                  <div className="divide-y divide-slate-200 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                    {visit.prescription.items && visit.prescription.items.map((item, i) => (
                      <div key={item.id} className="p-4 flex items-center justify-between text-xs">
                        <div className="space-y-1">
                          <div className="font-bold text-slate-900">{i + 1}. {item.drugName} <span className="text-[11px] font-normal text-slate-500">({item.dosage})</span></div>
                          <div className="text-emerald-700 font-medium">Cách dùng: {item.usageInstruction}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-slate-800 font-mono">x{item.quantity} {item.unit}</div>
                          <div className="text-[11px] text-slate-500 font-mono">{item.amount ? item.amount.toLocaleString('vi-VN') : 0} VNĐ</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500 text-xs">
                Chưa có đơn thuốc điện tử cho đợt khám này.
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
