'use client';

import { EditorContent, useEditor } from '@tiptap/react';
import React from 'react';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Text from '@tiptap/extension-text';
import { Extension } from '@tiptap/core';
import Document from '@tiptap/extension-document';
import { Plugin, PluginKey } from 'prosemirror-state';

const InlineDocument = Document.extend({
  content: 'text*',
});

export const SingleLine = Extension.create({
  name: 'singleLine',

  addKeyboardShortcuts() {
    return {
      Enter: () => true,
      'Shift-Enter': () => true,
    };
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('singleLine'),
        filterTransaction(tr) {
          for (const step of tr.steps) {
            // @ts-ignore
            const slice = step.slice;
            if (!slice || !slice.content) continue;

            for (let i = 0; i < slice.content.childCount; i++) {
              const node = slice.content.child(i);
              if (!node.isInline) return false;
            }
          }
          return true;
        },
      }),
    ];
  },
});

interface InlineTextEditorProps {
  value: string;
  onChange: (html: string) => void;
}

const InlineTextEditor: React.FC<InlineTextEditorProps> = ({
  value,
  onChange,
}) => {
  const [, setRefresh] = React.useState(0);

  const editor = useEditor({
    extensions: [InlineDocument, Text, Bold, Italic, SingleLine],
    content: value,

    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },

    onSelectionUpdate: () => {
      setRefresh((r) => r + 1);
    },

    editorProps: {
      attributes: {
        class: 'border rounded p-2 min-h-[36px] focus:outline-none w-full',
      },
    },
  });

  // ❗ ГОЛОВНЕ ВИПРАВЛЕННЯ ❗
  React.useEffect(() => {
    if (!editor) return;
    if (value !== editor.getHTML()) {
      editor.commands.setContent(value || '');
    }
  }, [value, editor]);

  if (!editor) return null;

  return (
    <div className="w-full border rounded-lg p-3 bg-white shadow-sm">
      <div className="flex gap-2 border-b pb-2 mb-2">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`px-2 py-1 rounded ${
            editor.isActive('bold') ? 'bg-gray-200 font-bold' : ''
          }`}
        >
          B
        </button>

        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`px-2 py-1 rounded ${
            editor.isActive('italic') ? 'bg-gray-200 italic' : ''
          }`}
        >
          I
        </button>
      </div>

      <EditorContent editor={editor} className="w-full" />
    </div>
  );
};

export default InlineTextEditor;
