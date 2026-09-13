import React from 'react';
import { Activity } from 'lucide-react';
import PdfPrintButton from '../PdfPrintButton';

export default function RealtimeDiagnosticResultsList({
  visit,
  renderDiagnosticResultDetails
}) {
  if (!visit || visit.status === 'COMPLETED') return null;

  return (
    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
      <h3 className="font-extrabold text-slate-900 text-sm flex items-center justify-between border-b border-slate-200 pb-3">
        <span className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-teal-600" />
          3. Kết Quả Cận Lâm Sàng Real-time (KTV Trả Về)
        </span>
      </h3>

      <div className="space-y-3">
        {visit.clinicalOrders && visit.clinicalOrders.flatMap(o => o.serviceRequests).some(sr => sr.result) ? (
          visit.clinicalOrders.flatMap(o => o.serviceRequests).filter(sr => sr.result).map(sr => (
            <div key={sr.id} className="bg-white p-4 rounded-xl border border-slate-200 space-y-2 shadow-sm">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-900 text-sm">{sr.serviceName}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-emerald-700 font-bold px-2 py-0.5 bg-emerald-50 rounded-md border border-emerald-200">FINAL</span>
                  <PdfPrintButton
                    patientId={visit.patientProfileId}
                    visitId={visit.id}
                    resultId={sr.result.id}
                    type="serviceResult"
                    label="In KQ PDF"
                    variant="emerald"
                    size="sm"
                  />
                </div>
              </div>
              {renderDiagnosticResultDetails(sr.result)}
            </div>
          ))
        ) : (
          <div className="text-center text-slate-500 py-6 text-xs bg-white rounded-xl border border-slate-200 shadow-sm">
            Chưa có kết quả cận lâm sàng hoàn tất từ KTV.
          </div>
        )}
      </div>
    </div>
  );
}

