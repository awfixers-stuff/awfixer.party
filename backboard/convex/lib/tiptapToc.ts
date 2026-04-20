/**
 * Extract table-of-contents entries from TipTap / ProseMirror JSON (document order).
 */

export type JSONContent = {
  type?: string;
  attrs?: Record<string, unknown>;
  content?: JSONContent[];
  text?: string;
};

function textContent(node: JSONContent): string {
  if (node.text !== undefined) return node.text;
  if (!node.content) return '';
  return node.content.map(textContent).join('');
}

function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '');
}

export function extractTocFromTiptapJson(bodyJson: string): Array<{
  id: string;
  title: string;
  level: number;
}> {
  let parsed: JSONContent;
  try {
    parsed = JSON.parse(bodyJson) as JSONContent;
  } catch {
    return [];
  }

  const items: Array<{ id: string; title: string; level: number }> = [];

  function walk(node: JSONContent) {
    if (node.type === 'heading') {
      const rawLevel = Number(node.attrs?.level ?? 2);
      const level = Math.min(6, Math.max(1, Number.isFinite(rawLevel) ? rawLevel : 2));
      const title = textContent(node).trim();
      if (title) {
        const id =
          typeof node.attrs?.id === 'string' && node.attrs.id.length > 0
            ? node.attrs.id
            : slugifyTitle(title);
        items.push({ id, title, level });
      }
    }
    if (node.content) {
      for (const child of node.content) {
        walk(child);
      }
    }
  }

  walk(parsed);
  return items;
}
