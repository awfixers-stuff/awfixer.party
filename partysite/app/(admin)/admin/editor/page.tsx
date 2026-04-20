import type { Metadata } from 'next';

import { EditorShell } from './editor-shell';
import { EditorWorkspace } from './editor-workspace';

export const metadata: Metadata = {
  title: 'Editor - Admin',
};

export default function EditorPage() {
  return (
    <EditorShell>
      <EditorWorkspace />
    </EditorShell>
  );
}
