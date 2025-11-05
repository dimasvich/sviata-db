import { Node, mergeAttributes, CommandProps } from '@tiptap/core';
type HTMLAttrs = Record<string, string | number | boolean>;

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    customImage: {
      insertCustomImage: (options: { src: string; alt?: string }) => ReturnType;
    };
  }
}

export const ImageNode = Node.create({
  name: 'customImage',
  group: 'block',
  selectable: true,
  draggable: true,

  addAttributes() {
    return {
      src: { default: null },
      alt: { default: '' },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'img[src]',
        getAttrs: (el: HTMLElement) => ({
          src: el.getAttribute('src'),
          alt: el.getAttribute('alt'),
        }),
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'img',
      mergeAttributes(HTMLAttributes, {
        class: 'max-w-full rounded-lg shadow-sm border border-gray-200 my-2',
      }),
    ];
  },

  addCommands() {
    return {
      insertCustomImage:
        (options: { src: string; alt?: string }) =>
        ({ chain }) =>
          chain()
            .insertContent({
              type: this.name,
              attrs: options,
            })
            .run(),
    };
  },
});
