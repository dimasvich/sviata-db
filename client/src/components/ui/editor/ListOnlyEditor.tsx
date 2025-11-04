'use client';

import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Node } from '@tiptap/core';
import React, { useEffect } from 'react';

// Власна нода list_item без <p>
const CustomListItem = Node.create({
  name: 'listItem',
  content: 'inline*',
  defining: true,
  parseHTML() {
    return [{ tag: 'li' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ['li', HTMLAttributes, 0];
  },
});

interface ListOnlyEditorProps {
  value: string;
  onChange: (html: string) => void;
}

const ListOnlyEditor: React.FC<ListOnlyEditorProps> = ({ value, onChange }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        listItem: false, // вимикаємо стандартний list_item
        heading: false,
        blockquote: false,
        codeBlock: false,
        horizontalRule: false,
      }),
      CustomListItem, // підключаємо власний
    ],
    content: value && value.includes('<ul>') ? value : '<ul><li></li></ul>',
    editorProps: {
      attributes: {
        class: 'editor-content focus:outline-none min-h-[150px]',
      },
    },
    onUpdate: ({ editor }) => {
      let html = editor.getHTML();

      // гарантуємо, що є лише один список
      const ulCount = (html.match(/<ul>/g) || []).length;
      if (ulCount > 1) {
        // залишаємо тільки перший <ul> і його вміст
        const match = html.match(/<ul>[\s\S]*<\/ul>/);

        html = match ? match[0] : '<ul><li></li></ul>';
        editor.commands.setContent(html);
      }

      onChange(html);
    },
  });

  useEffect(() => {
    if (editor) editor.chain().focus().run();
  }, [editor]);

  if (!editor) return <div>Loading editor...</div>;

  return (
    <div className="border rounded-lg p-3 bg-white shadow-sm">
      <div className="flex gap-2 border-b pb-2 mb-2">
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`px-2 py-1 rounded ${
            editor.isActive('bulletList') ? 'bg-gray-200 font-bold' : ''
          }`}
        >
          • Список
        </button>
      </div>

      <EditorContent editor={editor} />
    </div>
  );
};

export default ListOnlyEditor;
