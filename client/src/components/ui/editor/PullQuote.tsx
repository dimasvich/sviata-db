import { Node } from '@tiptap/core';

export const PullQuote = Node.create({
  name: 'pullQuote',
  group: 'block',
  content: 'paragraph+',
  defining: true,

  parseHTML() {
    return [
      {
        tag: 'figure.wp-block-pullquote',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['figure', { class: 'wp-block-pullquote' }, ['blockquote', 0]];
  },
});
