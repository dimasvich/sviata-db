'use client';

import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import React from 'react';

interface DefaultTextEditorProps {
  value: string;
  onChange: (html: string) => void;
}

const DefaultTextEditor: React.FC<DefaultTextEditorProps> = ({
  value,
  onChange,
}) => {
  const editor = useEditor({
    extensions: [StarterKit.configure({ heading: false })],
    content: value || '',
    editorProps: {
      attributes: {
        class: 'editor-content focus:outline-none min-h-[200px]',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  React.useEffect(() => {
    if (!editor) return;
    if (value !== editor.getHTML()) {
      editor.commands.setContent(value || '');
    }
  }, [value, editor]);

  if (!editor) return null;

  return (
    <div className="border rounded-lg p-3 bg-white shadow-sm">
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
        <button
          onClick={() => editor.chain().focus().setParagraph().run()}
          className="px-2 py-1 rounded hover:bg-gray-100"
        >
          ¶
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
};

export default DefaultTextEditor;
