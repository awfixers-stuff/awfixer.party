import { generateHTML } from '@tiptap/core';
import type { JSONContent } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';

const extensions = [StarterKit];

function sanitizeHtml(html: string): string {
  // Strip javascript: href/src values and on* event handler attributes
  return html
    .replace(/\bhref\s*=\s*["']\s*javascript:[^"']*/gi, 'href="#"')
    .replace(/\bsrc\s*=\s*["']\s*javascript:[^"']*/gi, 'src=""')
    .replace(/\bon\w+\s*=\s*["'][^"']*["']/gi, '');
}

export function tiptapJsonStringToHtml(json: string | undefined): string | null {
  if (!json?.trim()) return null;
  try {
    const doc = JSON.parse(json) as JSONContent;
    return sanitizeHtml(generateHTML(doc, extensions));
  } catch {
    return null;
  }
}
