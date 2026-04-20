export type EditorShellOpenRequest =
  | { mode: 'sitePage'; payload: { path: string } }
  /** Footer newsletter widget; full editor lands with CMS wiring. */
  | { mode: 'newsletter'; payload?: { section?: 'footer' } }
  /** Help-out application form builder; full editor lands with CMS wiring. */
  | { mode: 'helpOutForm'; payload: { roleSlug: string } };

export type EditorShellState = EditorShellOpenRequest | null;
