export function formatDate(date: Date): string {
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateWithoutYear(date: Date): string {
  return date.toLocaleDateString('zh-CN', {
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateTime(date: Date): string {
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDateTimeWithoutYear(date: Date): string {
  return date.toLocaleString('zh-CN', {
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDateTimeShort(date: Date): string {
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function isPublished(date: Date, now = new Date()): boolean {
  return date <= now;
}

export function getZonedYear(date: Date, timeZone: string): number {
  const year = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
  }).format(date);
  return Number(year);
}