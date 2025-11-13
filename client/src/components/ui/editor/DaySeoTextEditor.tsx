'use client';

import { Node, mergeAttributes } from '@tiptap/core';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import React, { useState } from 'react';

const BLOCKS = [
  { name: 'Кінець блоку', insert: 'block-end' },
  { name: 'Кінець календаря', insert: 'calendar-end' },
  { name: 'Свята в Україні', insert: 'holiday-ukraine' },
  { name: 'Професійні свята', insert: 'professional-holiday' },
  { name: 'Церковні свята', insert: 'church-holiday' },
  { name: 'Церковний календар', insert: 'church-calendar' },
  { name: 'Національні свята', insert: 'national-holiday' },
  { name: 'Прикмети і традиції (верхня частина)', insert: 'signs-block-top' },
  {
    name: 'Прикмети і традиції (внутрішня частина)',
    insert: 'signs-block-inner',
  },
  { name: 'Міжнародні свята', insert: 'holiday-world' },
  { name: 'Що не/можна робити', insert: 'day-rules' },
  { name: 'Історичні події (верхня частина)', insert: 'day-history-top' },
  { name: 'Історичні події (внутрішня частина)', insert: 'day-history-inner' },
  { name: 'Памʼятні дні', insert: 'memory-date' },
  { name: 'Останній блок', insert: 'last-block' },
  { name: 'Кінець Останнього блоку', insert: 'last-block-end' },
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
        priority: 1000,
        getAttrs: (el: Element) => {
          const placeholder = el.getAttribute('data-placeholder');
          return { 'data-placeholder': placeholder };
        },
      },
    ];
  },

  renderHTML({ node }) {
    const placeholder: string = node.attrs['data-placeholder'] || '';
    const blockName =
      BLOCKS.find((block) => block.insert === placeholder)?.name || placeholder;

    return [
      'div',
      mergeAttributes({ 'data-placeholder': placeholder }),
      `Блок ${blockName}`,
    ];
  },
});

interface SeoTextEditorProps {
  value: string;
  onChange: (html: string) => void;
}

const DaySeoTextEditor: React.FC<SeoTextEditorProps> = ({
  value,
  onChange,
}) => {
  const [, forceUpdate] = useState(0);
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2] } }),
      CustomBlock,
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
    onSelectionUpdate: () => {
      forceUpdate((x) => x + 1);
    },
  });

  if (!editor) return <div>Loading editor...</div>;

  return (
    <div className="relative w-full max-w-[1200px] mx-auto border rounded-lg bg-white shadow-sm overflow-hidden">
      <div className="flex flex-wrap gap-2 border-b px-3 py-2 bg-white sticky top-[0] z-50 shadow-sm">
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
        {([2] as const).map((level) => (
          <button
            key={`h${level}`}
            onClick={() =>
              editor
                .chain()
                .focus()
                .toggleHeading({ level: level as 2 })
                .run()
            }
            className={`px-2 py-1 rounded ${
              editor.isActive('heading', {
                level: level as 2,
              })
                ? 'bg-gray-200 font-bold'
                : ''
            }`}
          >
            H{level}
          </button>
        ))}
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

export default DaySeoTextEditor;
