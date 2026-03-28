import { sanitizeHtml } from 'sanitize-html';

const ALLOWED_TAGS = ['p', 'br', 'strong', 'em', 'u', 'b', 'i', 'ul', 'ol', 'li'];
const ALLOWED_ATTRIBUTES: Record<string, string[]> = {};

export function sanitizeInput(input: string): string {
  if (!input) return '';
  return sanitizeHtml(input, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTRIBUTES,
  });
}

export function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9._-]/g, '_').substring(0, 255);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 100);
}
