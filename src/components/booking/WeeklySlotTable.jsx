import { CalendarDays, Check, ChevronLeft, ChevronRight, Loader2, Moon, RefreshCw, Sun, Sunrise } from 'lucide-react';
import { addDays, dateKey, formatDate, slotKey, timeLabel } from './bookingUtils';

const periods = [
  { label: 'Buổi sáng', icon: Sunrise, contains: (hour) => hour < 12 },
  { label: 'Buổi chiều', icon: Sun, contains: (hour) => hour >= 12 && hour < 17 },
  { label: 'Buổi tối', icon: Moon, contains: (hour) => hour >= 17 },
];

export function WeeklySlotTable({ weekStart, today, slots, selectedSlot, onSelect, onChangeWeek, loading, error, onRetry, ready, disabled }) {
  const days = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
  const uniqueSlots = [...new Map(slots.map((slot) => [slotKey(slot), slot])).values()]
    .sort((left, right) => slotKey(left).localeCompare(slotKey(right)));
  const visiblePeriods = periods.filter((period, index) => index < 2 || uniqueSlots.some((slot) => period.contains(Number(timeLabel(slot.startTime).slice(0, 2)))));
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm" aria-labelledby="weekly-slot-heading">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5">
        <div>
          <h2 id="weekly-slot-heading" className="flex items-center gap-2 font-bold text-slate-900"><CalendarDays className="h-5 w-5 text-indigo-600" /> Chọn khung giờ khám</h2>
          <p className="mt-1 text-xs text-slate-500">{formatDate(weekStart)} – {formatDate(days[6])} · Giờ Việt Nam</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" disabled={weekStart <= today || disabled} onClick={() => onChangeWeek(addDays(weekStart, -7))} aria-label="Bảy ngày trước" className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 disabled:opacity-30"><ChevronLeft className="h-4 w-4" /></button>
          <button type="button" disabled={disabled || weekStart === today} onClick={() => onChangeWeek(today)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40">Hôm nay</button>
          <button type="button" disabled={disabled} onClick={() => onChangeWeek(addDays(weekStart, 7))} aria-label="Bảy ngày tiếp theo" className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 disabled:opacity-30"><ChevronRight className="h-4 w-4" /></button>
        </div>
      </div>
      {!ready ? <p className="p-12 text-center text-sm text-slate-500">Chọn cơ sở và chuyên khoa để xem lịch trống.</p>
        : loading ? <div className="flex min-h-72 items-center justify-center gap-2 text-sm text-slate-500" role="status"><Loader2 className="h-5 w-5 animate-spin text-indigo-600" /> Đang tải lịch trống…</div>
          : error ? <div className="space-y-3 p-10 text-center" role="alert"><p className="text-sm text-rose-700">{error}</p><button type="button" onClick={onRetry} className="inline-flex items-center gap-2 rounded-lg bg-indigo-50 px-4 py-2 text-xs font-bold text-indigo-700"><RefreshCw className="h-4 w-4" /> Thử lại</button></div>
            : <div className="overflow-x-auto">
              <table className="w-full min-w-[770px] table-fixed border-collapse text-center">
                <caption className="sr-only">Lịch trống trong bảy ngày. Chọn một khung giờ để đặt khám.</caption>
                <thead><tr>{days.map((day) => <th key={day} scope="col" className={`border-b border-r border-slate-100 px-1 py-4 last:border-r-0 ${day === today ? 'bg-indigo-50' : 'bg-slate-50/70'}`}>
                  <span className={`block text-xs font-semibold ${day === today ? 'text-indigo-700' : 'text-slate-500'}`}>{day === today ? 'Hôm nay' : new Date(`${day}T12:00:00Z`).toLocaleDateString('vi-VN', { weekday: 'short', timeZone: 'Asia/Ho_Chi_Minh' })}</span>
                  <span className="mt-1 block text-sm font-bold text-slate-800">{formatDate(day).slice(0, 5)}</span>
                </th>)}</tr></thead>
                <tbody>{visiblePeriods.map((period) => {
                  const Icon = period.icon;
                  return <tr key={period.label}>{days.map((day) => {
                    const dailySlots = uniqueSlots.filter((slot) => dateKey(slot.appointmentDate) === day);
                    const periodSlots = dailySlots.filter((slot) => period.contains(Number(timeLabel(slot.startTime).slice(0, 2))));
                    return <td key={day} className="border-b border-r border-slate-100 px-2 py-4 align-top last:border-r-0">
                      <span className="mb-3 flex items-center justify-center gap-1 text-[11px] font-medium text-slate-400"><Icon className="h-3.5 w-3.5" /> {period.label}</span>
                      <div className="space-y-2">{periodSlots.map((slot) => {
                        const selected = selectedSlot && slotKey(selectedSlot) === slotKey(slot);
                        return <button key={slotKey(slot)} type="button" disabled={disabled} aria-pressed={!!selected} aria-label={`${formatDate(day)}, ${timeLabel(slot.startTime)} đến ${timeLabel(slot.endTime)}`} onClick={() => onSelect(slot)} className={`relative w-full rounded-lg border px-1 py-2.5 text-[11px] font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 ${selected ? 'border-indigo-600 bg-indigo-600 text-white shadow-sm' : 'border-indigo-200 bg-white text-indigo-800 hover:border-indigo-500 hover:bg-indigo-50'}`}>
                          {timeLabel(slot.startTime)}–{timeLabel(slot.endTime)}{selected && <Check className="absolute right-0.5 top-0.5 h-2.5 w-2.5" />}
                        </button>;
                      })}{!periodSlots.length && <p className="px-1 py-3 text-[11px] leading-relaxed text-slate-400">{!dailySlots.length && period === periods[0] ? 'Không có lịch trống' : '—'}</p>}</div>
                    </td>;
                  })}</tr>;
                })}</tbody>
              </table>
            </div>}
      <div className="flex flex-wrap items-center gap-4 px-5 py-3 text-[11px] text-slate-500"><span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded border border-indigo-200 bg-white" /> Còn đặt được</span><span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-indigo-600" /> Đang chọn</span></div>
    </section>
  );
}
