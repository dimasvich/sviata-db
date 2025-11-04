import { Node } from '@tiptap/core';

export const QuoteBlock = Node.create({
  name: 'quoteBlock',
  group: 'block',
  content: 'paragraph+',
  defining: true,

  parseHTML() {
    return [{ tag: 'blockquote.wp-block-quote' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['blockquote', { class: 'wp-block-quote' }, 0];
  },
});
