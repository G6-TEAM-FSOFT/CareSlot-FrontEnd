import React from 'react';
import { History, RefreshCw, Pill, X, FileText } from 'lucide-react';
import PdfPrintButton from '../PdfPrintButton';
import { parseClinicalNote } from '../../utils/formatters';

export default function DoctorMedicalHistoryModal({
  show,
  visit,
  selectedEncounter,
  patientHistoryList,
  loadingHistory,
  onClose
}) {
  if (!show) return null;
  const pId = visit?.patientProfileId || selectedEncounter?.patientProfileId || (patientHistoryList && patientHistoryList[0]?.patientProfileId);
  const historyList = patientHistoryList || [];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-fadeIn space-y-0">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-700 to-purple-800 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <History className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg">Lịch Sử Khám Bệnh Bệnh Nhân</h3>
              <p className="text-xs text-indigo-100 font-mono">Bệnh nhân: {visit?.patientName || selectedEncounter?.patientName || 'Chi tiết lịch sử'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-xl transition text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body content */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          {loadingHistory ? (
            <div className="text-center py-12 text-slate-500 space-y-2">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-indigo-600" />
              <p className="font-medium">Đang tải lịch sử khám từ cơ sở dữ liệu...</p>
            </div>
          ) : historyList.length > 0 ? (
            <div className="space-y-4">
              {historyList.map((histVisit, index) => {
                const targetPatientId = pId || histVisit.patientProfileId || 1;
                const isVisitCompleted = histVisit.status === 'COMPLETED';

                return (
                  <div key={histVisit.id || index} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 hover:border-indigo-300 transition shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-indigo-800 text-sm">VISIT: {histVisit.visitCode}</span>
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md border ${isVisitCompleted ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                          {isVisitCompleted ? 'Đã hoàn tất' : 'Đang khám'}
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-slate-500">
                        {histVisit.createdAt ? new Date(histVisit.createdAt).toLocaleString('vi-VN') : '10/09/2026 09:30'}
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase block">Bác Sĩ Phụ Trách:</span>
                        <strong className="text-slate-800">{histVisit.primaryDoctorName || 'BS. Chuyên Khoa'}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase block">Chẩn Đoán Đã Ghi Nhận:</span>
                        <strong className="text-emerald-800">{histVisit.prescription?.diagnosisNote || histVisit.diagnosis || 'Khám tổng quát'}</strong>
                      </div>
                    </div>

                    {histVisit.clinicalNotes && histVisit.clinicalNotes.length > 0 && (
                      <div className="bg-indigo-50/50 p-2.5 rounded-xl border border-indigo-100 text-slate-700">
                        <span className="text-[10px] text-indigo-700 font-bold uppercase block mb-1">Ghi Chú Lâm Sàng:</span>
                        <p className="text-xs text-slate-700 font-medium">{parseClinicalNote(histVisit.clinicalNotes[0].formData)}</p>
                      </div>
                    )}

                    {/* Prescribed Medications */}
                    {histVisit.prescription?.items && histVisit.prescription.items.length > 0 && (
                      <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1.5">
                        <span className="text-[10px] text-slate-500 font-bold uppercase block flex items-center gap-1">
                          <Pill className="w-3 h-3 text-indigo-600" /> Thuốc đã kê:
                        </span>
                        <div className="divide-y divide-slate-100">
                          {histVisit.prescription.items.map((item, idx) => (
                            <div key={idx} className="py-1 flex justify-between items-center text-[11px]">
                              <span>{idx + 1}. {item.drugName} - <em className="text-slate-500">{item.dosage}</em></span>
                              <span className="font-mono font-bold text-amber-700">x{item.quantity} {item.unit}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* PDF Action Buttons Bar (Scoped to Visit) */}
                    <div className="pt-2 border-t border-slate-200/80 flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block w-full sm:w-auto">Chứng từ PDF Lượt khám #{histVisit.id}:</span>
                      
                      <PdfPrintButton
                        patientId={targetPatientId || histVisit.patientProfileId}
                        visitId={histVisit.id}
                        type="examination"
                        label="Phiếu Khám PDF"
                        variant="indigo"
                        size="sm"
                      />

                      <PdfPrintButton
                        patientId={targetPatientId || histVisit.patientProfileId}
                        visitId={histVisit.id}
                        prescriptionId={histVisit.prescription?.id}
                        type="prescription"
                        label="In Đơn Thuốc"
                        variant="emerald"
                        size="sm"
                        disabled={!isVisitCompleted}
                        disabledReason="Chỉ có thể in đơn thuốc khi đợt khám đã hoàn tất"
                      />

                      <PdfPrintButton
                        patientId={targetPatientId || histVisit.patientProfileId}
                        visitId={histVisit.id}
                        type="summary"
                        label="Tổng Hợp Lượt Khám"
                        variant="secondary"
                        size="sm"
                        disabled={!isVisitCompleted}
                        disabledReason="Chỉ có thể in tổng hợp khi đợt khám đã hoàn tất"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-4 text-center py-12 text-slate-500">
              <FileText className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="font-medium">Bệnh nhân chưa có lịch sử lượt khám nào.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition"
          >
            Đóng Lịch Sử Khám
          </button>
        </div>
      </div>
    </div>
  );
}

