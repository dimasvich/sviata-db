'use client';

import { Node, mergeAttributes } from '@tiptap/core';
import Heading from '@tiptap/extension-heading';
import Link from '@tiptap/extension-link';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import React, { useState } from 'react';
import ImageUpload from '../ImageUpload';
import { ImageNode } from './ImageNode';
import { QuoteBlock } from './QuoteBlock';
import { PullQuote } from './PullQuote';

const BLOCKS = [
  { name: 'Коли святкуємо (таблиця)', insert: 'when-section' },
  { name: 'Таймлайн', insert: 'timeline-section' },
  { name: 'Привітання', insert: 'greetings-section' },
  { name: 'Ідеї для постів', insert: 'ideas-section' },
  { name: 'Правила на день', insert: 'rules-section' },
  { name: 'Факти', insert: 'facts-section' },
  { name: 'Джерела', insert: 'sources-section' },
  { name: 'Пов`язані події', insert: 'related-section' },
  { name: 'Більше ідей для привітання', insert: 'moreIdeas-section' },
  { name: 'Листівки', insert: 'leaflets-section' },
];

export const CustomBlock = Node.create({
  name: 'customBlock',
  group: 'block',
  atom: true,
  content: 'inline*',

  addAttributes() {
    return {
      'data-placeholder': { default: null },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-placeholder]',
        getAttrs: (el: Element) => ({
          'data-placeholder': el.getAttribute('data-placeholder'),
        }),
      },
    ];
  },

  renderHTML({ node }) {
    const placeholder = node.attrs['data-placeholder'] || '';
    return [
      'div',
      mergeAttributes({ 'data-placeholder': placeholder }),
      `Блок ${BLOCKS.find((b) => b.insert === placeholder)?.name}`,
    ];
  },
});

interface SeoTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  newFiles: File[];
  setNewFiles: React.Dispatch<React.SetStateAction<File[]>>;
}

const SeoTextEditor: React.FC<SeoTextEditorProps> = ({
  value,
  onChange,
  newFiles,
  setNewFiles,
}) => {
  const [showUpload, setShowUpload] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [, forceUpdate] = useState(0);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3, 4, 5, 6] } }),
      CustomBlock,
      Heading,
      QuoteBlock,
      PullQuote,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: 'nofollow',
          target: '_blank',
          class: 'text-blue-600 underline hover:text-blue-800',
        },
      }),
    ],
    content: value || '',
    editorProps: {
      attributes: {
        class:
          'editor-content focus:outline-none min-h-[500px] max-h-[80vh] overflow-y-auto p-3',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    onSelectionUpdate: () => {
      forceUpdate((x) => x + 1);
    },
  });

  if (!editor) return <div>Loading editor...</div>;

  // 🔄 Повертаємо старий метод завантаження зображень
  const handleFileSelect = (file: File) => {
    setNewFiles((prev) => [...prev, file]);
    const fileName = file.name;

    editor
      .chain()
      .focus()
      .insertContent(`<img src="${fileName}" alt="" />`)
      .run();

    setShowUpload(false);
  };

  const handleAddLink = () => {
    if (!linkUrl.trim()) return;
    const textToInsert = linkText.trim() || linkUrl;
    editor
      .chain()
      .focus()
      .extendMarkRange('link')
      .insertContent(
        `<a href="${linkUrl}" target="_blank" rel="nofollow">${textToInsert}</a>`,
      )
      .run();
    setLinkUrl('');
    setLinkText('');
    setShowLinkModal(false);
  };

  return (
    <div className="relative w-full max-w-[1200px] mx-auto border rounded-lg bg-white shadow-sm overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 border-b px-3 py-2 bg-white sticky top-0 z-50 shadow-sm">
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
              editor.chain().focus().toggleHeading({ level }).run()
            }
            className={`px-2 py-1 rounded ${
              editor.isActive('heading', { level })
                ? 'bg-gray-200 font-bold'
                : ''
            }`}
          >
            H{level}
          </button>
        ))}

        <button
          onClick={() => setShowUpload(true)}
          className="px-2 py-1 rounded hover:bg-gray-100"
        >
          🖼️ Зображення
        </button>

        <button
          onClick={() => setShowLinkModal(true)}
          className={`px-2 py-1 rounded hover:bg-gray-100 ${
            editor.isActive('link') ? 'bg-blue-100 text-blue-700' : ''
          }`}
        >
          🔗 Посилання
        </button>

        <button
          onClick={() =>
            editor
              .chain()
              .focus()
              .insertContent(
                '<figure class="wp-block-pullquote"><blockquote><p></p></blockquote></figure>',
              )
              .run()
          }
          className="px-2 py-1 rounded hover:bg-gray-100"
        >
          ❝ blockquote
        </button>
        <button
          onClick={() =>
            editor
              .chain()
              .focus()
              .insertContent(
                '<figure class="wp-block-pullquote"><blockquote><p></p></blockquote></figure>',
              )
              .run()
          }
          className="px-2 py-1 rounded hover:bg-gray-100"
        >
          ❝ pullquote
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

      {/* Контент редактора */}
      <div className="px-3 py-2">
        <EditorContent editor={editor} />
      </div>

      {/* Модалка завантаження зображення */}
      {showUpload && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg w-[400px]">
            <h3 className="text-lg font-semibold mb-2 text-center">
              Завантаження зображення
            </h3>
            <ImageUpload onFileSelect={handleFileSelect} />
            <button
              onClick={() => setShowUpload(false)}
              className="mt-3 w-full py-2 bg-gray-100 rounded hover:bg-gray-200"
            >
              Скасувати
            </button>
          </div>
        </div>
      )}

      {/* Модалка для вставки посилання */}
      {showLinkModal && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg w-[400px]">
            <h3 className="text-lg font-semibold mb-3 text-center">
              Додати посилання
            </h3>

            <label className="block mb-2 text-sm font-medium">URL</label>
            <input
              type="text"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full border rounded p-2 mb-3 text-sm"
            />

            <label className="block mb-2 text-sm font-medium">Текст</label>
            <input
              type="text"
              value={linkText}
              onChange={(e) => setLinkText(e.target.value)}
              placeholder="Текст посилання"
              className="w-full border rounded p-2 mb-3 text-sm"
            />

            <div className="flex gap-2">
              <button
                onClick={handleAddLink}
                className="flex-1 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Додати
              </button>
              <button
                onClick={() => setShowLinkModal(false)}
                className="flex-1 py-2 bg-gray-100 rounded hover:bg-gray-200"
              >
                Скасувати
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeoTextEditor;
