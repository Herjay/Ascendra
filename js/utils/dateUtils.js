/**
 * Data Journey - Date & Time Utilities
 */

/**
 * Returns today's date formatted as YYYY-MM-DD
 */
export function getTodayDateString() {
  const d = new Date();
  return formatDateString(d);
}

/**
 * Formats a Date object as YYYY-MM-DD
 */
export function formatDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formats an ISO string or YYYY-MM-DD for human display (e.g. 'Oct 14, 2026')
 */
export function formatHumanDate(dateStr) {
  if (!dateStr) return '—';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    }
    return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  } catch (e) {
    return dateStr;
  }
}

/**
 * Calculates calendar days between two YYYY-MM-DD dates (inclusive or diff)
 */
export function daysBetween(startDateStr, endDateStr) {
  if (!startDateStr || !endDateStr) return 0;
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Formats minutes into human readable hours & minutes (e.g. 90 -> '1h 30m' or '1.5h')
 */
export function formatMinutes(minutes, style = 'mixed') {
  if (!minutes || minutes <= 0) return '0h';
  const hrs = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);

  if (style === 'decimal') {
    return `${(minutes / 60).toFixed(1)}h`;
  }

  if (hrs > 0 && mins > 0) return `${hrs}h ${mins}m`;
  if (hrs > 0) return `${hrs}h`;
  return `${mins}m`;
}

/**
 * Converts decimal hours (e.g. 1.5) to integer minutes (90)
 */
export function hoursToMinutes(hours) {
  if (!hours) return 0;
  return Math.round(parseFloat(hours) * 60);
}

/**
 * Converts minutes (90) to decimal hours (1.5)
 */
export function minutesToHours(minutes) {
  if (!minutes) return 0;
  return parseFloat((minutes / 60).toFixed(2));
}
