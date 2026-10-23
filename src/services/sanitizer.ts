/**
 * Input and Output Sanitizer
 * Protects against XSS, HTML injection, and prompt manipulation
 */

const HTML_ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
};

/**
 * Escapes special HTML characters to prevent XSS
 */
export function escapeHtml(str: string): string {
  if (typeof str !== 'string') return '';
  return str.replace(/[&<>"'/]/g, (char) => HTML_ESCAPE_MAP[char] || char);
}

/**
 * Strips dangerous HTML tags and script protocols from AI-generated or user text
 */
export function sanitizeText(text: string): string {
  if (typeof text !== 'string') return '';
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/javascript:[^\s"']*/gi, '')
    .replace(/data:text\/html[^\s"']*/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
}

/**
 * Sanitizes user input with length boundary enforcement
 */
export function sanitizeUserInput(input: string, maxLength: number = 500): string {
  if (!input || typeof input !== 'string') return '';
  const cleaned = sanitizeText(input).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');
  return cleaned.slice(0, maxLength);
}

/**
 * Detects common prompt injection signatures (for warning or system prompt isolation)
 */
export function hasPromptInjectionSignals(text: string): boolean {
  if (!text) return false;
  const injectionPatterns = [
    /ignore (all )?previous instructions/i,
    /disregard (all )?prior/i,
    /system prompt/i,
    /you are now a/i,
    /dan mode/i,
    /jailbreak/i,
    /as an unfiltered ai/i,
    /reveal your secret/i,
    /bypass safety/i,
    /override your rules/i,
    /acting as an untamed/i,
    /developer mode enabled/i,
    /forget (all )?(prior|previous) instructions/i,
    /print your (initial|system) instructions/i,
  ];
  return injectionPatterns.some((pattern) => pattern.test(text));
}
