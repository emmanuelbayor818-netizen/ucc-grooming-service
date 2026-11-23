/**
 * Phone number and WhatsApp formatting utilities for UCC Grooming Services
 */

/**
 * Formats a phone number for WhatsApp wa.me links.
 * WhatsApp requires the international format with country code (233 for Ghana)
 * without leading '+' or '0', and without spaces or hyphens.
 * 
 * Example:
 * - "0599772951" -> "233599772951"
 * - "+233599772951" -> "233599772951"
 * - "024 945 7727" -> "233249457727"
 */
export function formatWhatsAppNumber(phone: string): string {
  if (!phone) return "";
  const digits = phone.replace(/[^0-9]/g, "");

  // Local Ghana 10-digit number starting with 0 (e.g., 0599772951)
  if (digits.startsWith("0") && digits.length === 10) {
    return `233${digits.slice(1)}`;
  }

  // Already has Ghana international code 233
  if (digits.startsWith("233")) {
    return digits;
  }

  // 9 digits without leading 0 (e.g., 599772951)
  if (digits.length === 9) {
    return `233${digits}`;
  }

  return digits;
}

/**
 * Generates a direct WhatsApp link (wa.me) with pre-filled message text.
 */
export function getWhatsAppUrl(phone: string, message?: string): string {
  const formatted = formatWhatsAppNumber(phone);
  if (!formatted) return "#";
  if (message) {
    return `https://wa.me/${formatted}?text=${encodeURIComponent(message)}`;
  }
  return `https://wa.me/${formatted}`;
}
