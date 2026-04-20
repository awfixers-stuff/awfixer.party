import type { Extensions } from '@tiptap/core';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import StarterKit from '@tiptap/starter-kit';

export type EditorPreset = 'minimal' | 'article' | 'post' | 'form' | 'full';

export function getRichTextExtensions(options: {
  preset: EditorPreset;
  placeholder: string;
}): Extensions {
  const { preset, placeholder } = options;
  // All presets share the same base stack for now; branch here when forms or
  // posts need custom nodes or different StarterKit options.
  void preset;
  return [
    StarterKit,
    Placeholder.configure({ placeholder }),
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        class: 'text-blue-600 underline',
      },
    }),
  ];
}
