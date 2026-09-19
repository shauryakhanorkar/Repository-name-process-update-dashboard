import { ProjectUpdate } from '../types';

function normalizeDateOnly(value: string): string | null {
  const trimmedValue = value.trim();
  const isoMatch = trimmedValue.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;

  const formMatch = trimmedValue.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!formMatch) return null;

  const first = Number(formMatch[1]);
  const second = Number(formMatch[2]);
  const year = Number(formMatch[3]);
  const month = first > 12 ? second : first;
  const day = first > 12 ? first : second;
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  if (month < 1 || month > 12 || day < 1 || day > daysInMonth) return null;

  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function timestampDateKey(value: string): string | null {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;

  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(parsed);
  const dateParts = Object.fromEntries(
    parts.map(({ type, value: partValue }) => [type, partValue])
  );

  return `${dateParts.year}-${dateParts.month}-${dateParts.day}`;
}

export function businessDateKey(update: ProjectUpdate): string | null {
  const details = typeof update.details === 'string'
    ? parseDetails(update.details)
    : update.details;
  const formDate = getFormDate(details);
  if (formDate) return formDate;

  const productionDate = normalizeDateOnly(update.date);
  if (productionDate) return productionDate;

  return timestampDateKey(update.timestamp);
}

export function isActualSubmittedUpdate(update: ProjectUpdate): boolean {
  const hasDetails = Boolean(update.details && typeof update.details === 'object' && Object.keys(update.details).length);
  const hasEmployeeEmail = Boolean(update.employeeEmail?.trim());
  if (!hasEmployeeEmail && !hasDetails) return false;

  return update.formName?.trim().toLowerCase() !== 'auto-generated placeholder';
}

function parseDetails(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function getFormDate(details: unknown): string | null {
  if (!details || typeof details !== 'object') return null;

  const dateValue = Object.entries(details as Record<string, unknown>)
    .find(([key]) => key.trim().toLowerCase() === 'date')?.[1];
  const rawDate = Array.isArray(dateValue) ? dateValue[0] : dateValue;

  return typeof rawDate === 'string' ? normalizeDateOnly(rawDate) : null;
}