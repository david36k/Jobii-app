export const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('he-IL', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(date);
};

export const formatDateFull = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
};
