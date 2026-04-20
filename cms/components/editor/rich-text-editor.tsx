'use client';

import type { JSONContent } from '@tiptap/core';
import { useEditor, EditorContent } from '@tiptap/react';
import { useCallback, useMemo, useState } from 'react';

import { type EditorPreset, getRichTextExtensions } from '@/lib/editor/presets';

export type RichTextEditorProps = {
  initialContent?: JSONContent | null;
  onChange?: (json: JSONContent) => void;
  placeholder?: string;
  preset?: EditorPreset;
};

export function RichTextEditor({
  initialContent,
  onChange,
  placeholder = 'Start typing...',
  preset = 'article',
}: RichTextEditorProps) {
  const [linkUrl, setLinkUrl] = useState<string>('');
  const [showLinkInput, setShowLinkInput] = useState(false);

  const extensions = useMemo(
    () => getRichTextExtensions({ preset, placeholder }),
    [preset, placeholder],
  );

  const editor = useEditor({
    extensions,
    content: initialContent,
    onUpdate: ({ editor: ed }) => {
      onChange?.(ed.getJSON());
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-sm sm:prose-base lg:prose-lg xl:prose-xl focus:outline-none min-h-[300px] max-w-none p-4',
      },
    },
  });

  const setLink = useCallback(() => {
    if (!editor) return;
    if (linkUrl === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
    }
    setLinkUrl('');
    setShowLinkInput(false);
  }, [editor, linkUrl]);

  const toggleBold = () => editor?.chain().focus().toggleBold().run();
  const toggleItalic = () => editor?.chain().focus().toggleItalic().run();
  const toggleStrike = () => editor?.chain().focus().toggleStrike().run();
  const toggleCode = () => editor?.chain().focus().toggleCode().run();
  const toggleHeading = (level: 1 | 2 | 3) =>
    editor?.chain().focus().toggleHeading({ level }).run();
  const toggleBulletList = () => editor?.chain().focus().toggleBulletList().run();
  const toggleOrderedList = () => editor?.chain().focus().toggleOrderedList().run();
  const toggleBlockquote = () => editor?.chain().focus().toggleBlockquote().run();
  const toggleCodeBlock = () => editor?.chain().focus().toggleCodeBlock().run();
  const undo = () => editor?.chain().focus().undo().run();
  const redo = () => editor?.chain().focus().redo().run();

  const isActive = (type: string, attrs?: Record<string, unknown>) =>
    editor?.isActive(type, attrs ?? {}) ?? false;

  return (
    <div className="border rounded-lg overflow-hidden bg-background">
      <div className="flex flex-wrap items-center gap-1 border-b p-2 bg-muted/30">
        <button
          type="button"
          onClick={toggleBold}
          className={`p-2 rounded hover:bg-muted ${isActive('bold') ? 'bg-muted font-bold' : ''}`}
          title="Bold"
        >
          B
        </button>
        <button
          type="button"
          onClick={toggleItalic}
          className={`p-2 rounded hover:bg-muted italic ${isActive('italic') ? 'bg-muted' : ''}`}
          title="Italic"
        >
          I
        </button>
        <button
          type="button"
          onClick={toggleStrike}
          className={`p-2 rounded hover:bg-muted line-through ${
            isActive('strike') ? 'bg-muted' : ''
          }`}
          title="Strikethrough"
        >
          S
        </button>
        <button
          type="button"
          onClick={toggleCode}
          className={`p-2 rounded hover:bg-muted font-mono ${isActive('code') ? 'bg-muted' : ''}`}
          title="Code"
        >
          {'</>'}
        </button>

        <div className="w-px h-6 bg-border mx-1" />

        <button
          type="button"
          onClick={() => toggleHeading(1)}
          className={`p-2 rounded hover:bg-muted ${
            isActive('heading', { level: 1 }) ? 'bg-muted font-bold' : ''
          }`}
          title="Heading 1"
        >
          H1
        </button>
        <button
          type="button"
          onClick={() => toggleHeading(2)}
          className={`p-2 rounded hover:bg-muted ${
            isActive('heading', { level: 2 }) ? 'bg-muted font-bold' : ''
          }`}
          title="Heading 2"
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => toggleHeading(3)}
          className={`p-2 rounded hover:bg-muted ${
            isActive('heading', { level: 3 }) ? 'bg-muted font-bold' : ''
          }`}
          title="Heading 3"
        >
          H3
        </button>

        <div className="w-px h-6 bg-border mx-1" />

        <button
          type="button"
          onClick={toggleBulletList}
          className={`p-2 rounded hover:bg-muted ${isActive('bulletList') ? 'bg-muted' : ''}`}
          title="Bullet List"
        >
          • List
        </button>
        <button
          type="button"
          onClick={toggleOrderedList}
          className={`p-2 rounded hover:bg-muted ${isActive('orderedList') ? 'bg-muted' : ''}`}
          title="Ordered List"
        >
          1. List
        </button>

        <div className="w-px h-6 bg-border mx-1" />

        <button
          type="button"
          onClick={toggleBlockquote}
          className={`p-2 rounded hover:bg-muted ${isActive('blockquote') ? 'bg-muted' : ''}`}
          title="Quote"
        >
          "
        </button>
        <button
          type="button"
          onClick={toggleCodeBlock}
          className={`p-2 rounded hover:bg-muted font-mono ${
            isActive('codeBlock') ? 'bg-muted' : ''
          }`}
          title="Code Block"
        >
          {'{ }'}
        </button>

        <div className="w-px h-6 bg-border mx-1" />

        {showLinkInput ? (
          <div className="flex items-center gap-1">
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://..."
              className="px-2 py-1 text-sm border rounded w-40"
              onKeyDown={(e) => e.key === 'Enter' && setLink()}
            />
            <button
              type="button"
              onClick={setLink}
              className="px-2 py-1 text-sm bg-primary text-primary-foreground rounded"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => {
                setShowLinkInput(false);
                setLinkUrl('');
              }}
              className="px-2 py-1 text-sm border rounded"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowLinkInput(true)}
            className={`p-2 rounded hover:bg-muted ${isActive('link') ? 'bg-muted' : ''}`}
            title="Add Link"
          >
            Link
          </button>
        )}

        <div className="w-px h-6 bg-border mx-1" />

        <button
          type="button"
          onClick={undo}
          disabled={!editor?.can().undo()}
          className="p-2 rounded hover:bg-muted disabled:opacity-50"
          title="Undo"
        >
          Undo
        </button>
        <button
          type="button"
          onClick={redo}
          disabled={!editor?.can().redo()}
          className="p-2 rounded hover:bg-muted disabled:opacity-50"
          title="Redo"
        >
          Redo
        </button>
      </div>

      <EditorContent editor={editor} className="min-h-[300px]" />
    </div>
  );
}
