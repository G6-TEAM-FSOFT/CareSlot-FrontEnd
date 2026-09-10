import React from 'react';
import { CheckCircle2, Stethoscope, Pill, Activity } from 'lucide-react';

export default function CompletedVisitSummaryCard({
  visit,
  diagnosisNote,
  dispositionType,
  dispositionNotes,
  prescriptionItems,
  formDataText
}) {
  if (!visit || visit.status !== 'COMPLETED') return null;

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-5 rounded-2xl shadow-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-8 h-8 text-emerald-200 flex-shrink-0" />
          <div>
            <h3 className="font-extrabold text-base text-white">ĐƠN THUỐC ĐIỆN TỬ & ĐỢT KHÁM ĐÃ HOÀN TẤT</h3>
            <p className="text-xs text-emerald-100">Bệnh nhân đã hoàn tất đầy đủ quy trình khám lâm sàng, chỉ định CLS và kê đơn thuốc.</p>
          </div>
        </div>
        <span className="px-3 py-1 bg-white/20 text-white font-mono font-bold text-xs rounded-xl backdrop-blur-md">
          VISIT #{visit.id}
        </span>
      </div>

      {/* Diagnosis & Disposition Summary */}
      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4 shadow-sm">
        <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-200 pb-3">
          <Stethoscope className="w-4 h-4 text-emerald-600" />
          1. Kết Luận Chẩn Đoán & Hướng Điều Trị
        </h3>

        <div className="grid sm:grid-cols-2 gap-4 text-xs">
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1">
            <span className="text-[10px] text-slate-500 font-bold uppercase block">Chẩn Đoán Bệnh Chính:</span>
            <div className="font-extrabold text-slate-900 text-sm text-emerald-800">
              {visit.prescription?.diagnosisNote || diagnosisNote || 'Viêm dạ dày - tá tràng cấp tính (K29.1)'}
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1">
            <span className="text-[10px] text-slate-500 font-bold uppercase block">Kết Cục Đợt Khám (Disposition):</span>
            <div className="font-extrabold text-slate-900 text-sm text-indigo-800">
              {visit.disposition?.dispositionType === 'OUTPATIENT' ? 'Điều trị ngoại trú (Kê đơn về nhà)' :
               visit.disposition?.dispositionType === 'REFERRED' ? 'Chuyển tuyến điều trị' :
               visit.disposition?.dispositionType === 'ADMITTED' ? 'Chỉ định Nhập viện' :
               dispositionType}
            </div>
          </div>
        </div>

        {(visit.disposition?.notes || dispositionNotes) && (
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1 text-xs">
            <span className="text-[10px] text-slate-500 font-bold uppercase block">Lời Dặn Bác Sĩ & Hướng Dẫn Tái Khám:</span>
            <div className="font-medium text-slate-800 font-mono">
              {visit.disposition?.notes || dispositionNotes}
            </div>
          </div>
        )}
      </div>

      {/* Issued Prescription */}
      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
            <Pill className="w-4 h-4 text-emerald-600" />
            2. Đơn Thuốc Điện Tử Đã Phát Hành ({(visit.prescription?.items || prescriptionItems).length} thuốc)
          </h3>
          <span className="text-xs font-mono font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-lg border border-teal-200">
            Mã RX: {visit.prescription?.prescriptionCode || 'RX-FINAL'}
          </span>
        </div>

        <div className="divide-y divide-slate-200 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm text-xs">
          {(visit.prescription?.items || prescriptionItems).map((item, i) => (
            <div key={i} className="p-3.5 flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="font-extrabold text-slate-900">{i + 1}. {item.drugName} ({item.dosage})</div>
                <div className="text-emerald-700 text-[11px] font-semibold">HDSD: {item.usageInstruction}</div>
              </div>
              <div className="text-right font-bold text-amber-700 font-mono text-sm">x{item.quantity} {item.unit}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Vital signs summary */}
      {visit.vitalSigns && visit.vitalSigns.length > 0 && (
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4 shadow-sm">
          <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-200 pb-3">
            <Activity className="w-4 h-4 text-emerald-600" />
            3. Chỉ Số Sinh Tồn & Bệnh Sử Đã Ghi Nhận
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-white p-3 rounded-xl border border-slate-200">
              <span className="text-slate-500 block text-[10px]">Huyết áp (Bp)</span>
              <strong className="font-mono text-slate-900 text-sm">{visit.vitalSigns[0].systolicBp}/{visit.vitalSigns[0].diastolicBp} mmHg</strong>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-200">
              <span className="text-slate-500 block text-[10px]">Nhịp tim (Heart)</span>
              <strong className="font-mono text-slate-900 text-sm">{visit.vitalSigns[0].heartRateBpm} nhip/p</strong>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-200">
              <span className="text-slate-500 block text-[10px]">Nhiệt độ (Temp)</span>
              <strong className="font-mono text-slate-900 text-sm">{visit.vitalSigns[0].temperatureC} °C</strong>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-200">
              <span className="text-slate-500 block text-[10px]">SpO2</span>
              <strong className="font-mono text-slate-900 text-sm">{visit.vitalSigns[0].spo2}%</strong>
            </div>
          </div>

          {visit.clinicalNotes && visit.clinicalNotes.length > 0 && (
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1 text-xs">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Bệnh Sử Ban Đầu:</span>
              <div className="font-mono text-slate-800">
                {formDataText}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
