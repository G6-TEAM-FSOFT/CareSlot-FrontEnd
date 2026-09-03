export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return '0 VNĐ';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

export const formatDateDisplay = (dateString) => {
  if (!dateString) return '';
  if (typeof dateString === 'string') {
    const parts = dateString.split('T')[0].split('-');
    if (parts.length === 3 && parts[0].length === 4) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
  }
  return formatDate(dateString);
};

export const getAvatarInitial = (name) => {
  if (!name || typeof name !== 'string') return 'P';
  const trimmed = name.trim();
  if (!trimmed) return 'P';
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  const first = parts[0].charAt(0);
  const last = parts[parts.length - 1].charAt(0);
  return `${first}${last}`.toUpperCase();
};

export const formatTime = (timeString) => {
  if (!timeString) return '';
  const date = new Date(`1970-01-01T${timeString}`);
  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};


