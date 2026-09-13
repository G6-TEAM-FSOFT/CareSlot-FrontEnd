import React from 'react';
import { Pill } from 'lucide-react';
import PdfPrintButton from '../PdfPrintButton';

export default function PrescriptionAndFinalizeForm({
  visit,
  loading,
  diagnosisNote, setDiagnosisNote,
  dispositionType, setDispositionType,
  dispositionNotes, setDispositionNotes,
  prescriptionItems,
  handleFinalizeVisit
}) {
  if (!visit) return null;

  return (
    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
          <Pill className="w-4 h-4 text-emerald-600" />
          4. Kê Đơn Thuốc Điện Tử & Kết Luận Đợt Khám
        </h3>
        
        <div className="flex flex-wrap items-center gap-2">
          <PdfPrintButton
            patientId={visit.patientProfileId || visit.patientProfile?.id}
            visitId={visit.id}
            type="examination"
            label="In Phiếu Khám"
            variant="indigo"
            size="sm"
          />

          <PdfPrintButton
            patientId={visit.patientProfileId || visit.patientProfile?.id}
            visitId={visit.id}
            prescriptionId={visit.prescription?.id}
            type="prescription"
            label="In Đơn Thuốc"
            variant="emerald"
            size="sm"
          />

          <PdfPrintButton
            patientId={visit.patientProfileId || visit.patientProfile?.id}
            visitId={visit.id}
            type="summary"
            label="Tổng Hợp Lượt Khám"
            variant="secondary"
            size="sm"
          />

          {visit.status !== 'COMPLETED' && (
            <button
              type="button"
              disabled={loading}
              onClick={handleFinalizeVisit}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 font-extrabold text-white text-xs rounded-xl shadow-md active:scale-95 transition flex items-center gap-1.5"
            >
              <Pill className="w-4 h-4" />
              XUẤT ĐƠN THUỐC & ĐÓNG VISIT (COMPLETED)
            </button>
          )}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 text-xs">
        <div className="space-y-1.5">
          <label className="font-bold text-slate-800 block">Chẩn Đoán Bệnh Chính (Diagnosis):</label>
          <input
            type="text"
            value={diagnosisNote}
            onChange={e => setDiagnosisNote(e.target.value)}
            disabled={visit.status === 'COMPLETED'}
            className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none shadow-sm disabled:bg-slate-100"
          />
        </div>

        <div className="space-y-1.5">
          <label className="font-bold text-slate-800 block">Kết Cục Đợt Khám (Disposition):</label>
          <select
            value={dispositionType}
            onChange={e => setDispositionType(e.target.value)}
            disabled={visit.status === 'COMPLETED'}
            className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none shadow-sm disabled:bg-slate-100"
          >
            <option value="OUTPATIENT">Điều trị ngoại trú (Kê đơn thuốc về nhà)</option>
            <option value="REFERRED">Chuyển tuyến điều trị</option>
            <option value="ADMITTED">Chỉ định Nhập viện</option>
          </select>
        </div>
      </div>

      <div className="space-y-1.5 text-xs">
        <label className="font-bold text-slate-800 block">Lời Dặn Bác Sĩ / Tái Khám:</label>
        <textarea
          rows={2}
          value={dispositionNotes}
          onChange={e => setDispositionNotes(e.target.value)}
          disabled={visit.status === 'COMPLETED'}
          className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 shadow-sm disabled:bg-slate-100"
        />
      </div>

      <div className="space-y-2 text-xs">
        <label className="font-bold text-slate-800 block">Danh Sách Thuốc Điện Tử Kê Đơn:</label>
        <div className="divide-y divide-slate-200 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          {prescriptionItems.map((item, i) => (
            <div key={i} className="p-3 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900">{i + 1}. {item.drugName} ({item.dosage})</div>
                <div className="text-emerald-700 text-[11px] font-semibold">{item.usageInstruction}</div>
              </div>
              <div className="text-right font-bold text-amber-700">x{item.quantity} {item.unit}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

