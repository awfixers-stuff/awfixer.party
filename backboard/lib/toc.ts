/**
 * Shared table-of-contents types and pure helpers (safe for scripts and RSC).
 */

export interface TOCItem {
  id: string;
  title: string;
  /** Heading level in 2–6 (h2–h6), used to build nested TOC trees. */
  level: number;
}

/** Nested tree for sidebar rendering (built from a flat `TOCItem[]`). */
export interface TOCNode extends TOCItem {
  children: TOCNode[];
}

/** Turn a flat `TOCItem[]` (in document order) into a tree by heading level. */
export function nestTocItems(items: TOCItem[]): TOCNode[] {
  const root: TOCNode[] = [];
  const stack: TOCNode[] = [];

  for (const item of items) {
    const node: TOCNode = { ...item, children: [] };
    while (stack.length > 0 && stack[stack.length - 1].level >= item.level) {
      stack.pop();
    }
    if (stack.length === 0) {
      root.push(node);
    } else {
      stack[stack.length - 1].children.push(node);
    }
    stack.push(node);
  }
  return root;
}

export function flattenTocIds(nodes: TOCNode[]): string[] {
  const ids: string[] = [];
  for (const n of nodes) {
    ids.push(n.id);
    ids.push(...flattenTocIds(n.children));
  }
  return ids;
}

export function decodeHtmlEntities(s: string): string {
  return s
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

/** Markdown-style headings (e.g. legal copy stored as markdown strings). */
export function generateTOC(content: string): TOCItem[] {
  const items: TOCItem[] = [];
  const headingRegex = /^(#{1,3})\s+(.+)$/gm;
  let match: RegExpExecArray | null;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const title = match[2];
    const id = title
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '');

    items.push({ id, title, level });
  }

  return items;
}

/**
 * Extract TOC entries from a TSX page in document order.
 * Supports:
 * - `<section id="...">` + `<h2>...</h2>` without id (anchor id from section)
 * - `<h2 id="...">` … `<h6 id="...">` (explicit ids; use for subsections at any depth)
 * - Plain `<h2>...</h2>` only when inside an open `<section id="...">`
 */
export function extractTocFromTsx(source: string): TOCItem[] {
  const items: TOCItem[] = [];
  let currentSectionId: string | null = null;
  let i = 0;
  const len = source.length;

  while (i < len) {
    if (source[i] !== '<') {
      i++;
      continue;
    }

    const rest = source.slice(i);
    let m: RegExpMatchArray | null;

    if ((m = rest.match(/^<section[^>]*\s+id="([^"]+)"[^>]*>/))) {
      currentSectionId = m[1];
      i += m[0].length;
      continue;
    }
    if (rest.startsWith('</section>')) {
      currentSectionId = null;
      i += 10;
      continue;
    }
    if ((m = rest.match(/^<h([2-6])\s+id="([^"]+)"[^>]*>([^<]+)<\/h\1>/))) {
      const level = Number(m[1]);
      items.push({
        id: m[2],
        title: decodeHtmlEntities(m[3].trim()),
        level,
      });
      i += m[0].length;
      continue;
    }
    if ((m = rest.match(/^<h2>([^<]+)<\/h2>/))) {
      if (currentSectionId) {
        items.push({
          id: currentSectionId,
          title: decodeHtmlEntities(m[1].trim()),
          level: 2,
        });
      }
      i += m[0].length;
      continue;
    }

    i++;
  }

  return items;
}
