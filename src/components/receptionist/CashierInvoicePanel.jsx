import React from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, Eye, ChevronRight, X, User, Printer } from 'lucide-react';
import CompactJourneySteps from './CompactJourneySteps';
import PdfPrintButton from '../PdfPrintButton';

export default function CashierInvoicePanel({
  activeVisit,
  loading,
  onOpenPatientModal,
  onClearActiveVisit,
  onPayInvoice
}) {
  return (
    <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 space-y-6 shadow-sm flex flex-col justify-between">
      <div className="space-y-6">

        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-600" />
            2. Đợt Khám & Thu Tiền Hóa Đơn
          </h2>
        </div>

        {activeVisit ? (
          <div className="space-y-5">

            {/* Patient Info Card */}
            <div className="bg-gradient-to-br from-slate-50 to-emerald-50/30 p-4 rounded-2xl border border-slate-200 space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between text-[10px] text-emerald-800 font-mono font-bold uppercase tracking-widest">
                <span>ĐỢT KHÁM ĐANG MỞ • VISIT ID #{activeVisit.id}</span>
                <span className={`px-2 py-0.5 rounded border ${activeVisit.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-amber-100 text-amber-800 border-amber-300'}`}>
                  {activeVisit.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="font-extrabold text-slate-900 text-lg">{activeVisit.patientName}</div>
              </div>
              <div className="text-xs text-slate-600 grid grid-cols-2 gap-2 pt-1 border-t border-slate-200">
                <div>Mã Visit: <span className="text-cyan-700 font-mono font-bold">{activeVisit.visitCode}</span></div>
                <div>SĐT: <span className="text-slate-800 font-mono">{activeVisit.patientPhone}</span></div>
                <div>Bác sĩ chính: <span className="text-emerald-700 font-semibold">{activeVisit.primaryDoctorName}</span></div>
                <div>Cơ sở: <span className="text-slate-700">{activeVisit.clinicName}</span></div>
              </div>

              {/* PDF Action Buttons for Receptionist */}
              <div className="pt-2.5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Xuất & In Chứng Từ:</span>
                <div className="flex flex-wrap items-center gap-1.5">
                  <PdfPrintButton
                    patientId={activeVisit.patientProfileId || activeVisit.patientProfile?.id}
                    visitId={activeVisit.id}
                    type="examination"
                    label="In Phiếu Khám"
                    variant="indigo"
                    size="sm"
                  />
                  <PdfPrintButton
                    patientId={activeVisit.patientProfileId || activeVisit.patientProfile?.id}
                    visitId={activeVisit.id}
                    prescriptionId={activeVisit.prescription?.id}
                    type="prescription"
                    label="In Đơn Thuốc"
                    variant="emerald"
                    size="sm"
                    disabled={activeVisit.status !== 'COMPLETED'}
                    disabledReason="Chỉ có thể in đơn thuốc sau khi bác sĩ hoàn tất đợt khám"
                  />
                  <PdfPrintButton
                    patientId={activeVisit.patientProfileId || activeVisit.patientProfile?.id}
                    visitId={activeVisit.id}
                    type="summary"
                    label="Tổng Hợp Lượt Khám"
                    variant="secondary"
                    size="sm"
                    disabled={activeVisit.status !== 'COMPLETED'}
                    disabledReason="Chỉ có thể in tổng hợp sau khi bác sĩ hoàn tất đợt khám"
                  />
                </div>
              </div>
            </div>

            {/* Compact Journey Stepper Panel for Receptionist */}
            <CompactJourneySteps visit={activeVisit} />

            {/* Invoices List */}
            <div className="space-y-3">
              <div className="text-xs text-slate-500 font-bold uppercase tracking-wider flex items-center justify-between">
                <span>Danh Sách Hóa Đơn Phát Sinh:</span>
                <span className="text-amber-700">{activeVisit.invoices?.length || 0} Hóa đơn</span>
              </div>

              {activeVisit.invoices && activeVisit.invoices.length > 0 ? (
                activeVisit.invoices.map(inv => (
                  <div
                    key={inv.id}
                    className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-900 text-sm">
                          Hóa đơn #{inv.id} <span className="text-[11px] font-mono text-cyan-700">({inv.invoiceType})</span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">{inv.invoiceCode}</div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-extrabold border ${inv.status === 'PAID'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-amber-100 text-amber-800 border-amber-300 animate-pulse'
                        }`}>
                        {inv.status === 'PAID' ? '✅ ĐÃ THANH TOÁN' : '🟡 CHỜ THU TIỀN'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                      <div>
                        <div className="text-[10px] text-slate-500">Tổng tiền:</div>
                        <div className="text-base font-black text-amber-700">
                          {inv.totalAmount ? inv.totalAmount.toLocaleString('vi-VN') : 0} VNĐ
                        </div>
                      </div>

                      {inv.status !== 'PAID' && (
                        <button
                          disabled={loading}
                          onClick={() => onPayInvoice(inv.id)}
                          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 font-extrabold text-white text-xs rounded-xl transition-all shadow-sm active:scale-95"
                        >
                          THU TIỀN NGAY
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-slate-500 py-6 text-xs bg-slate-50 rounded-2xl border border-slate-200">
                  Chưa phát sinh hóa đơn cận lâm sàng mới trong đợt khám này.
                </div>
              )}
            </div>

          </div>
        ) : (
          <div className="text-center text-slate-500 py-16 text-xs space-y-3 bg-slate-50 rounded-2xl border border-slate-200 p-6">
            <CreditCard className="w-12 h-12 text-slate-400 mx-auto" />
            <p className="font-semibold text-slate-600">Vui lòng chọn hoặc Check-in bệnh nhân ở bảng bên trái.</p>
            <p className="text-[11px] text-slate-500">Thông tin chi tiết đợt khám, tiến trình khám bệnh và các hóa đơn thu tiền sẽ hiển thị tại đây.</p>
          </div>
        )}

      </div>
    </div>
  );
}
