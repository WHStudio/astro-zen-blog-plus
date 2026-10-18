export function formatDate(date: Date, timeZone?: string): string {
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...(timeZone ? { timeZone } : {}),
  });
}

export function formatDateWithoutYear(date: Date, timeZone?: string): string {
  return date.toLocaleDateString('zh-CN', {
    month: 'long',
    day: 'numeric',
    ...(timeZone ? { timeZone } : {}),
  });
}

export function formatDateTime(date: Date, timeZone?: string): string {
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...(timeZone ? { timeZone } : {}),
  });
}

export function formatDateTimeWithoutYear(date: Date, timeZone?: string): string {
  return date.toLocaleString('zh-CN', {
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...(timeZone ? { timeZone } : {}),
  });
}

export function formatDateTimeShort(date: Date, timeZone?: string): string {
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    ...(timeZone ? { timeZone } : {}),
  });
}

export function formatZonedISODate(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? '';
  return `${value('year')}-${value('month')}-${value('day')}`;
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