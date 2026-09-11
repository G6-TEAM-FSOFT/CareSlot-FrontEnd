export const ASSIGNMENT_NOTICE = 'Bác sĩ và phòng khám sẽ được thông báo sau khi hoàn tất check-in và tạo lượt khám.';
export const BOOKING_DEPOSIT = 100000;

export const unwrapData = (response) => response?.data ?? response;
export const asList = (response) => {
  const data = unwrapData(response);
  return Array.isArray(data) ? data : data?.content ?? [];
};
export const formatMoney = (amount) => amount == null ? '—' : `${Number(amount).toLocaleString('vi-VN')}đ`;
export const dateKey = (value) => Array.isArray(value)
  ? `${value[0]}-${String(value[1]).padStart(2, '0')}-${String(value[2]).padStart(2, '0')}`
  : String(value ?? '').slice(0, 10);
export const timeLabel = (value) => Array.isArray(value)
  ? `${String(value[0]).padStart(2, '0')}:${String(value[1] ?? 0).padStart(2, '0')}`
  : String(value ?? '').slice(0, 5);
export const formatDate = (value) => {
  const key = dateKey(value);
  if (!key) return '—';
  return key.split('-').reverse().join('/');
};
export const todayInVietnam = () => {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
  const part = (type) => parts.find((item) => item.type === type).value;
  return `${part('year')}-${part('month')}-${part('day')}`;
};
export const addDays = (date, count) => {
  const value = new Date(`${date}T12:00:00Z`);
  value.setUTCDate(value.getUTCDate() + count);
  return value.toISOString().slice(0, 10);
};
export const serverTimestamp = (value) => {
  if (!value) return NaN;
  const text = Array.isArray(value)
    ? `${dateKey(value)}T${timeLabel(value.slice(3))}:${String(value[5] ?? 0).padStart(2, '0')}`
    : String(value);
  // Server LocalDateTime values describe the clinic's Vietnam timezone.
  return Date.parse(/(Z|[+-]\d{2}:?\d{2})$/.test(text) ? text : `${text}+07:00`);
};
export const holdSecondsRemaining = (appointment) => {
  const end = serverTimestamp(appointment?.holdExpiresAt);
  return Number.isFinite(end) ? Math.max(0, Math.ceil((end - Date.now()) / 1000)) : null;
};
export const formatTimestamp = (value) => {
  const timestamp = serverTimestamp(value);
  return Number.isFinite(timestamp) ? new Date(timestamp).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }) : '—';
};
export const slotKey = (slot) => `${dateKey(slot.appointmentDate)}|${timeLabel(slot.startTime)}|${timeLabel(slot.endTime)}`;
