/**
 * Security & Anti-Hacking Utilities
 * 
 * Provides defense-in-depth against:
 * - Cross-Site Scripting (XSS)
 * - Injection & payload pollution
 * - Brute-force credential stuffing
 * - Automated bot spam & form flooding
 * - Malicious URL redirection
 */

/**
 * Strips HTML tags, script tags, control characters, and limits string length
 */
export function sanitizeText(input: unknown, maxLen = 1000): string {
  if (typeof input !== 'string') return '';
  
  return input
    // Remove HTML tags
    .replace(/<[^>]*>?/gm, '')
    // Remove control characters (except newline and carriage return)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Replace multiple spaces/newlines
    .trim()
    // Enforce maximum length cap
    .slice(0, maxLen);
}

/**
 * Validates and sanitizes email address
 */
export function sanitizeEmail(input: unknown): string {
  if (typeof input !== 'string') return '';
  const cleaned = input.trim().toLowerCase();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (cleaned.length > 120 || !emailRegex.test(cleaned)) {
    return '';
  }
  return cleaned;
}

/**
 * Validates and sanitizes phone/WhatsApp number
 */
export function sanitizePhone(input: unknown): string {
  if (typeof input !== 'string') return '';
  // Only allow digits, plus, hyphens, and spaces
  const cleaned = input.replace(/[^\d+-\s]/g, '').trim();
  return cleaned.slice(0, 30);
}

/**
 * Validates and sanitizes URLs to prevent javascript: or malicious protocol execution
 */
export function sanitizeUrl(url: unknown): string {
  if (typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  // Prohibit dangerous pseudo-protocols
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('vbscript:') ||
    lower.startsWith('data:text/html') ||
    lower.startsWith('blob:text/html')
  ) {
    return '#';
  }

  // Allow standard web protocols, mailto, tel, or safe image data
  if (
    lower.startsWith('https://') ||
    lower.startsWith('http://') ||
    lower.startsWith('mailto:') ||
    lower.startsWith('tel:') ||
    lower.startsWith('/') ||
    lower.startsWith('./') ||
    lower.startsWith('data:image/')
  ) {
    return trimmed;
  }

  return '#';
}

/**
 * Sliding window rate-limiter for form submissions to block denial-of-wallet and bot spam
 */
const rateLimitMap = new Map<string, number[]>();

export function checkRateLimit(actionKey: string, maxAttempts = 5, windowMs = 60000): { allowed: boolean; retryAfterSec: number } {
  const now = Date.now();
  const timestamps = (rateLimitMap.get(actionKey) || []).filter(t => now - t < windowMs);
  
  if (timestamps.length >= maxAttempts) {
    const oldest = timestamps[0];
    const retryAfterSec = Math.ceil((windowMs - (now - oldest)) / 1000);
    return { allowed: false, retryAfterSec };
  }

  timestamps.push(now);
  rateLimitMap.set(actionKey, timestamps);
  return { allowed: true, retryAfterSec: 0 };
}

/**
 * Brute force login protection
 */
const LOGIN_ATTEMPTS_KEY = 'sec_login_attempts';
const LOGIN_LOCKOUT_KEY = 'sec_login_lockout';
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 60000; // 1 minute lockout

export function getLoginSecurityStatus(): { isLocked: boolean; remainingSec: number } {
  try {
    const lockoutUntil = parseInt(sessionStorage.getItem(LOGIN_LOCKOUT_KEY) || '0', 10);
    const now = Date.now();
    if (lockoutUntil > now) {
      return {
        isLocked: true,
        remainingSec: Math.ceil((lockoutUntil - now) / 1000)
      };
    }
  } catch {
    // Fallback if storage restricted
  }
  return { isLocked: false, remainingSec: 0 };
}

export function recordFailedLoginAttempt(): { isLocked: boolean; remainingSec: number } {
  try {
    const currentAttempts = parseInt(sessionStorage.getItem(LOGIN_ATTEMPTS_KEY) || '0', 10) + 1;
    sessionStorage.setItem(LOGIN_ATTEMPTS_KEY, String(currentAttempts));

    if (currentAttempts >= MAX_LOGIN_ATTEMPTS) {
      const lockoutUntil = Date.now() + LOCKOUT_DURATION_MS;
      sessionStorage.setItem(LOGIN_LOCKOUT_KEY, String(lockoutUntil));
      sessionStorage.removeItem(LOGIN_ATTEMPTS_KEY);
      return { isLocked: true, remainingSec: Math.ceil(LOCKOUT_DURATION_MS / 1000) };
    }
  } catch {
    // ignore
  }
  return { isLocked: false, remainingSec: 0 };
}

export function resetLoginSecurity(): void {
  try {
    sessionStorage.removeItem(LOGIN_ATTEMPTS_KEY);
    sessionStorage.removeItem(LOGIN_LOCKOUT_KEY);
  } catch {
    // ignore
  }
}

/**
 * List of verified authorized administrator accounts
 * In sync with Firestore Security Rules
 */
export const AUTHORIZED_ADMIN_EMAILS: readonly string[] = [
  '3tahirmeer@gmail.com',
  '3sosososo0331@gmail.com',
  '3mahmoodkhan@gmail.com'
];

/**
 * Validates if an email belongs to the authorized council admin whitelist
 */
export function isAuthorizedAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return AUTHORIZED_ADMIN_EMAILS.includes(normalized);
}

/**
 * Sanitizes and validates a Card ID for QR verification
 */
export function sanitizeCardId(cardId: unknown): string {
  if (typeof cardId !== 'string') return '';
  let cleaned = cardId.trim().toUpperCase().replace(/\s*-\s*/g, '-').replace(/\s+/g, '-');
  const urlMatch = cleaned.match(/[?&]VERIFY=([A-Z0-9_-]{3,32})/i);
  if (urlMatch) {
    cleaned = urlMatch[1].toUpperCase();
  }
  cleaned = cleaned.replace(/^(?:CARD|ID|CARDID|MEMBERID|MEMBERSHIP)[:\-#\s]*/i, '');
  // Format: e.g. AB-26-123456 or alphanumeric with hyphens up to 32 chars
  if (/^[A-Z0-9_-]{3,32}$/.test(cleaned)) {
    return cleaned;
  }
  return '';
}

