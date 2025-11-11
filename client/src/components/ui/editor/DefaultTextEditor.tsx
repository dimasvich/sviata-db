'use client';

import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import React, { useEffect, useState } from 'react';

interface DefaultTextEditorProps {
  value: string;
  onChange: (html: string) => void;
}

// Функція для конвертації з <ul><li> у <p>
function convertListToParagraphs(html: string): string {
  if (!html) return '';

  // Прибираємо обгортку <ul>
  let cleaned = html.replace(/<\/?ul>/gi, '');

  // Замінюємо <li> на <p>
  cleaned = cleaned.replace(/<li>/gi, '<p>');

  // Замінюємо </li> на </p>
  cleaned = cleaned.replace(/<\/li>/gi, '</p>');

  // Прибираємо зайві дефіси або символи на початку рядка
  cleaned = cleaned.replace(/^–\s*/gm, '');

  // Прибираємо &nbsp;
  cleaned = cleaned.replace(/&nbsp;/g, ' ');

  return cleaned.trim();
}

const DefaultTextEditor: React.FC<DefaultTextEditorProps> = ({
  value,
  onChange,
}) => {
  const [, forceUpdate] = useState(0);

  const editor = useEditor({
    extensions: [StarterKit.configure({ heading: false })],
    content: '', // пусто при старті
    editorProps: {
      attributes: {
        class: 'editor-content focus:outline-none min-h-[200px]',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    onSelectionUpdate: () => {
      forceUpdate((x) => x + 1);
    },
  });

  // Оновлюємо контент після отримання value
  useEffect(() => {
    if (editor && value) {
      editor.commands.setContent(convertListToParagraphs(value));
      alert(value)
    }
  }, [editor, value]);

  if (!editor) return <div>Loading editor...</div>;

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
