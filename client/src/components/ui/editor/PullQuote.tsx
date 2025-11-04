import { Node } from '@tiptap/core';

export const PullQuote = Node.create({
  name: 'pullQuote',
  group: 'block',
  content: 'paragraph+',
  defining: true,

  parseHTML() {
    return [{ tag: 'pullquote.wp-pull-quote' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['pullquote', { class: 'wp-pull-quote' }, 0];
  },
});
