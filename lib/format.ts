/** Shared date/time formatting for history, reminders, and timelines. */

export function formatDateTime(
  iso: string,
  options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }
): string {
  return new Date(iso).toLocaleString("en-US", options);
}

export function formatDate(iso: string): string {
  return formatDateTime(iso, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatTime(iso: string): string {
  return formatDateTime(iso, {
    hour: "numeric",
    minute: "2-digit",
  });
}
