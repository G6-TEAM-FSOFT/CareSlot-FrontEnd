import { CalendarCheck2, CreditCard, Loader2 } from 'lucide-react';
import { BOOKING_DEPOSIT, formatDate, formatMoney, timeLabel } from './bookingUtils';

export function BookingSummary({ patient, clinic, specialty, slot, submitting, disabled, onSubmit }) {
  return <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" aria-labelledby="booking-summary-heading">
    <h2 id="booking-summary-heading" className="mb-4 flex items-center gap-2 font-bold text-slate-900"><CalendarCheck2 className="h-5 w-5 text-indigo-600" /> Tóm tắt lịch khám</h2>
    <div className="grid gap-4 text-sm sm:grid-cols-2">
      <div><p className="mb-1 text-xs text-slate-500">Người khám</p><p className="font-semibold text-slate-800">{patient?.fullName || 'Chưa chọn hồ sơ'}</p></div>
      <div><p className="mb-1 text-xs text-slate-500">Cơ sở · Chuyên khoa</p><p className="font-semibold text-slate-800">{clinic?.name || 'Chưa chọn cơ sở'}</p>{specialty && <p className="mt-1 text-xs text-slate-500">{specialty.name}</p>}</div>
      <div><p className="mb-1 text-xs text-slate-500">Ngày và giờ khám</p><p className="font-semibold text-indigo-700">{slot ? `${formatDate(slot.appointmentDate)} · ${timeLabel(slot.startTime)}–${timeLabel(slot.endTime)}` : 'Chọn một khung giờ trong bảng lịch'}</p></div>
      <div><p className="mb-1 text-xs text-slate-500">Tiền đặt cọc</p><p className="text-xl font-bold text-indigo-700">{formatMoney(BOOKING_DEPOSIT)}</p></div>
    </div>
    <div className="mt-5 flex flex-col items-start justify-between gap-4 border-t border-slate-100 pt-4 sm:flex-row sm:items-center">
      <p className="max-w-xs text-xs leading-relaxed text-slate-500">Khung giờ được giữ chỗ khi bạn tiếp tục thanh toán.</p>
      <button type="button" disabled={disabled || submitting} onClick={onSubmit} className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto">
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}{submitting ? 'Đang giữ chỗ…' : `Tiếp tục thanh toán · ${formatMoney(BOOKING_DEPOSIT)}`}
      </button>
    </div>
  </section>;
}
