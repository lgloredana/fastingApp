import { format } from 'date-fns';
import { ro } from 'date-fns/locale';

/**
 * Safe date formatting that prevents hydration mismatches
 * by using consistent formatting between server and client
 */
export function safeFormatDate(
  date: number | Date,
  formatString: string,
  options: { locale?: any } = {}
): string {
  try {
    // Use consistent formatting that works on both server and client
    if (typeof window === 'undefined') {
      // Server-side: use basic formatting without locale
      const dateObj = new Date(date);
      switch (formatString) {
        case 'HH:mm, dd MMM':
          return dateObj.toLocaleString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: 'short',
          });
        case 'dd MMM':
          return dateObj.toLocaleString('en-GB', {
            day: '2-digit',
            month: 'short',
          });
        case 'HH:mm':
          return dateObj.toLocaleString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
          });
        case 'EEEE, dd MMMM yyyy':
          return dateObj.toLocaleDateString('en-GB', {
            weekday: 'long',
            day: '2-digit',
            month: 'long',
            year: 'numeric',
          });
        default:
          return dateObj.toLocaleString('en-GB');
      }
    } else {
      // Client-side: use date-fns with Romanian locale
      return format(date, formatString, { locale: ro, ...options });
    }
  } catch (error) {
    // Fallback to basic date string
    return new Date(date).toLocaleString();
  }
}

/**
 * Hook for safe date formatting that prevents hydration issues
 */
export function useSafeDate() {
  const isClient = typeof window !== 'undefined';

  const formatDate = (
    date: number | Date,
    formatString: string,
    options: { locale?: any } = {}
  ): string => {
    if (!isClient) {
      // Server-side: return placeholder or basic format
      return new Date(date).toLocaleString('en-GB');
    }

    // Client-side: use full date-fns formatting
    return format(date, formatString, { locale: ro, ...options });
  };

  return { formatDate, isClient };
}
