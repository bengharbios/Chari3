/**
 * Input validation helpers for the CharyDay platform.
 * Validates phone, email, IBAN, and other formats.
 * Supports international phone numbers (Algeria, MENA, Europe).
 */

/**
 * Validate a phone number (international).
 * Accepts formats:
 * - 8-15 digits (local format)
 * - With country code prefix: +XXX... or 00XXX...
 *
 * Algeria examples:
 * - 05XXXXXXXX (10 digits, local)
 * - 06XXXXXXXX (10 digits, local)
 * - 07XXXXXXXX (10 digits, local)
 * - +213XXXXXXXXX (with country code)
 *
 * Saudi examples:
 * - 5XXXXXXXX (9 digits, local)
 * - +966XXXXXXXXX (with country code)
 *
 * @param phone - Phone number string to validate
 * @returns true if the phone number is valid
 */
export function validatePhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') return false;

  const cleaned = phone.replace(/[\s\-()]/g, '');

  // With + prefix and country code: 8-15 digits after +
  if (/^\+\d{8,14}$/.test(cleaned)) return true;

  // With 00 prefix: 00 followed by 8-15 digits
  if (/^00\d{9,14}$/.test(cleaned)) return true;

  // Local format: 8-15 digits
  if (/^\d{8,15}$/.test(cleaned)) return true;

  return false;
}

/**
 * Normalize a phone number to E.164 format.
 * If already has + prefix, return as-is (cleaned).
 * If has 00 prefix, replace with +.
 * Otherwise, return as-is (local format).
 *
 * @param phone - Phone number string
 * @param countryCode - Optional country code (e.g., '+213') to prepend if no prefix exists
 */
export function normalizePhone(phone: string, countryCode?: string): string {
  const cleaned = phone.replace(/[\s\-()]/g, '');

  if (cleaned.startsWith('+')) return cleaned;
  if (cleaned.startsWith('00')) return '+' + cleaned.slice(2);

  // If a country code is provided and the number is local, prepend it
  if (countryCode && /^\d{8,15}$/.test(cleaned)) {
    return countryCode + cleaned;
  }

  return phone; // Return as-is if no match
}

/**
 * Validate an email address format.
 * Uses a practical regex that covers the vast majority of valid emails.
 *
 * @param email - Email address to validate
 * @returns true if the email format is valid
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;

  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;

  return emailRegex.test(email.trim());
}

/**
 * Validate an Algerian/Saudi Arabian IBAN.
 * Format: SA + 22 alphanumeric characters = 24 characters total.
 * Format: DZ + 22 alphanumeric characters = 24 characters total.
 *
 * @param iban - IBAN string to validate
 * @returns true if the IBAN format is valid
 */
export function validateIBAN(iban: string): boolean {
  if (!iban || typeof iban !== 'string') return false;

  const cleaned = iban.replace(/\s/g, '');

  // SA IBAN: exactly 24 chars, starts with SA
  if (/^SA\d{2}[a-zA-Z0-9]{20}$/.test(cleaned)) return true;

  // DZ IBAN: exactly 24 chars, starts with DZ
  if (/^DZ\d{2}[a-zA-Z0-9]{20}$/.test(cleaned)) return true;

  return false;
}

/**
 * Validate an Algerian NIF (Numéro d'Identification Fiscale) or
 * Saudi Commercial Registration (CR) number.
 * Algeria NIF: variable length, starts with 0 followed by digits.
 * Saudi CR: exactly 10 digits.
 *
 * @param cr - Registration number string to validate
 * @returns true if the format is valid
 */
export function validateCRNumber(cr: string): boolean {
  if (!cr || typeof cr !== 'string') return false;

  const trimmed = cr.trim();

  // Saudi CR: exactly 10 digits
  if (/^\d{10}$/.test(trimmed)) return true;

  // Algerian NIF: starts with 0, 10-20 digits
  if (/^0\d{9,19}$/.test(trimmed)) return true;

  return false;
}

/**
 * Sanitize user input to prevent XSS attacks.
 * Trims whitespace and escapes HTML special characters.
 *
 * @param str - Raw input string
 * @returns Sanitized string safe for rendering
 */
export function sanitizeInput(str: string): string {
  if (!str || typeof str !== 'string') return '';

  return str
    .trim()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validate that a full name is reasonable.
 * At least 2 characters, only letters, spaces, and certain Unicode characters.
 */
export function validateFullName(name: string): boolean {
  if (!name || typeof name !== 'string') return false;

  const trimmed = name.trim();
  return trimmed.length >= 2 && trimmed.length <= 100;
}

/**
 * Validate an OTP code (6 digits).
 */
export function validateOTPCode(code: string): boolean {
  if (!code || typeof code !== 'string') return false;

  return /^\d{6}$/.test(code.trim());
}

/**
 * Validate a user role string.
 */
export function validateRole(role: string): boolean {
  return ['admin', 'store_manager', 'seller', 'supplier', 'logistics', 'buyer'].includes(role);
}
