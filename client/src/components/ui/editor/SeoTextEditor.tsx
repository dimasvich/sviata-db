'use client';

import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Node, mergeAttributes } from '@tiptap/core';
import Heading from '@tiptap/extension-heading';

const BLOCKS = [
  { name: 'Коли святкуємо (таблиця)', insert: 'when-section' },
  { name: 'Коли святкуємо (заголовок)', insert: 'when-section-title' },
  { name: 'Таймлайн', insert: 'timeline-section' },
  { name: 'Привітання', insert: 'greetings-section' },
  { name: 'Ідеї для постів', insert: 'ideas-section' },
  { name: 'Правила на день', insert: 'rules-section' },
  { name: 'Факти', insert: 'facts-section' },
  { name: 'Джерела', insert: 'sources-section' },
  { name: 'Пов`язані події', insert: 'related-section' },
  { name: 'Більше ідей для привітання', insert: 'moreIdeas-section' },
];

export const CustomBlock = Node.create({
  name: 'customBlock',
  group: 'block',
  atom: true,
  content: 'inline*',

  addAttributes() {
    return {
      'data-placeholder': {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-placeholder]',
        getAttrs: (el: Element) => {
          const placeholder = el.getAttribute('data-placeholder');
          return { 'data-placeholder': placeholder };
        },
      },
    ];
  },

  renderHTML({ node }) {
    const placeholder: string = node.attrs['data-placeholder'] || '';
    return [
      'div',
      mergeAttributes({ 'data-placeholder': placeholder }),
      `Блок ${BLOCKS.find((block) => block.insert === placeholder)?.name}`,
    ];
  },
});

interface SeoTextEditorProps {
  value: string;
  onChange: (html: string) => void;
}

const SeoTextEditor: React.FC<SeoTextEditorProps> = ({ value, onChange }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3, 4, 5, 6] } }),
      CustomBlock,
      Heading,
    ],
    content: value || '',
    editorProps: {
      attributes: {
        class: 'editor-content focus:outline-none min-h-[200px]',
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
  });

  if (!editor) return <div>Loading editor...</div>;

  return (
    <div className="border rounded-lg p-3 bg-white shadow-sm">
      <div className="flex flex-wrap gap-2 border-b pb-2 mb-2">
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

        {([1, 2, 3, 4, 5, 6] as const).map((level) => (
          <button
            key={`h${level}`}
            onClick={() =>
              editor
                .chain()
                .focus()
                .toggleHeading({ level: level as 1 | 2 | 3 | 4 | 5 | 6 })
                .run()
            }
            className={`px-2 py-1 rounded ${
              editor.isActive('heading', {
                level: level as 1 | 2 | 3 | 4 | 5 | 6,
              })
                ? 'bg-gray-200 font-bold'
                : ''
            }`}
          >
            H{level}
          </button>
        ))}
        <button
          onClick={() => {
            const src = prompt('Введіть назву зображення з розширенням (src):');
            if (!src) return;
            const alt = prompt('Введіть alt текст для зображення:') || '';
            editor
              .chain()
              .focus()
              .insertContent(`<img src="${src}" alt="${alt}" />`)
              .run();
          }}
          className="px-2 py-1 rounded hover:bg-gray-100"
        >
          🖼️ Зображення
        </button>

        {BLOCKS.map((block) => (
          <button
            key={block.name}
            onClick={() =>
              editor
                .chain()
                .focus()
                .insertContent(
                  `<div data-placeholder="${block.insert}">Блок ${block.name}</div>`,
                )
                .run()
            }
            className="px-2 py-1 rounded hover:bg-gray-100"
          >
            {block.name}
          </button>
        ))}
      </div>

      <EditorContent editor={editor} />
    </div>
  );
};

export default SeoTextEditor;
