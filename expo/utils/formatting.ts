export const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  return new Intl.DateTimeFormat('he-IL', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(d);
};

export const formatDateFull = (date: Date | string): string => {
  const d = new Date(date);
  return new Intl.DateTimeFormat('he-IL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d);
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'ILS',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'open': return '#3B82F6';
    case 'full': return '#059669';
    case 'closed': return '#6B7280';
    case 'pending': return '#F59E0B';
    case 'accepted': return '#059669';
    case 'rejected': return '#DC2626';
    default: return '#6B7280';
  }
};

export const getStatusText = (status: string) => {
  const mapping: Record<string, string> = {
    open: 'פתוח',
    full: 'מלא',
    closed: 'סגור',
    pending: 'ממתין',
    accepted: 'אושר',
    rejected: 'נדחה',
  };
  return mapping[status] || status;
};
