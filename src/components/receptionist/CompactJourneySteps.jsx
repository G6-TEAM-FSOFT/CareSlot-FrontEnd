import React from 'react';
import { Activity } from 'lucide-react';

export default function CompactJourneySteps({ visit }) {
  if (!visit) return null;
  const encounters = visit.encounters || [];
  const orders = visit.clinicalOrders || [];
  const hasPrescription = !!visit.prescription;
  const hasDisposition = !!visit.disposition;

  return (
    <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-3 text-xs shadow-sm">
      <div className="flex items-center justify-between font-bold text-slate-900 border-b border-slate-200 pb-2">
        <span className="flex items-center gap-1.5 text-cyan-600">
          <Activity className="w-4 h-4" />
          <span>Tiến Trình Đợt Khám Realtime</span>
        </span>
        <span className="text-[10px] text-slate-500">Visit #{visit.id}</span>
      </div>

      <div className="space-y-2">
        {/* Step 1: Check-in */}
        <div className="flex items-center justify-between text-emerald-800 font-semibold bg-white p-2 rounded-lg border border-slate-200">
          <span>1. Check-in Tiếp Nhận:</span>
          <span className="font-mono text-cyan-700 font-bold">{visit.visitCode} (✓ Done)</span>
        </div>

        {/* Step 2: Encounters */}
        {encounters.length > 0 ? (
          encounters.map((enc, idx) => (
            <div key={enc.id} className="flex items-center justify-between bg-white p-2 rounded-lg border border-slate-200">
              <div>
                <span className="font-bold text-slate-900">{enc.encounterType === 'INITIAL_CONSULTATION' ? '2. Khám Ban Đầu' : `Khám Đọc KQ (Vòng ${idx})`}:</span>
                <span className="text-slate-500 ml-1.5">{enc.roomName} ({enc.roomNumber})</span>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                enc.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                enc.status === 'IN_PROGRESS' ? 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse' :
                'bg-slate-100 text-slate-600 border-slate-200'
              }`}>
                {enc.status === 'COMPLETED' ? 'Đã khám xong' : enc.status === 'IN_PROGRESS' ? 'Đang trong phòng' : 'Chờ khám'}
              </span>
            </div>
          ))
        ) : (
          <div className="text-slate-500 text-[11px] p-2">Chưa khởi tạo lượt khám.</div>
        )}

        {/* Step 3: Orders */}
        {orders.length > 0 && orders.map(ord => (
          <div key={ord.id} className="bg-white p-2 rounded-lg border border-slate-200 space-y-1">
            <div className="flex items-center justify-between font-semibold text-slate-800">
              <span>3. Chỉ định CLS ({ord.orderCode}):</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                ord.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                {ord.status === 'COMPLETED' ? 'Đủ KQ' : 'Đang làm/Chờ thu tiền'}
              </span>
            </div>
            {ord.serviceRequests && (
              <div className="pl-2 border-l border-slate-200 space-y-1 text-[11px]">
                {ord.serviceRequests.map(sr => (
                  <div key={sr.id} className="flex items-center justify-between text-slate-600">
                    <span>• {sr.serviceName}</span>
                    <span className={`font-bold ${sr.result ? 'text-emerald-700' : sr.task?.status === 'READY' ? 'text-indigo-700' : 'text-amber-700'}`}>
                      {sr.result ? '✅ KQ FINAL' : sr.task?.status === 'READY' ? '🟡 Đang làm' : '🔒 Chờ thu tiền'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Step 4: Prescription */}
        <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-slate-200 text-slate-800">
          <span>4. Đơn thuốc & Kết luận:</span>
          <span className={`font-bold text-[10px] px-2 py-0.5 rounded border ${
            hasPrescription || hasDisposition ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'
          }`}>
            {hasPrescription ? 'Đã kê đơn' : hasDisposition ? 'Đã kết luận' : 'Chưa kê đơn'}
          </span>
        </div>
      </div>
    </div>
  );
}
