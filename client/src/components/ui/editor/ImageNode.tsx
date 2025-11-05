import { CommandProps, Node, mergeAttributes } from '@tiptap/core'

type HTMLAttrs = Record<string, string | number | boolean>

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    customImage: {
      insertCustomImage: (options: { src: string; alt?: string }) => ReturnType
    }
  }
}

export const ImageNode = Node.create({
  name: 'customImage',
  group: 'block',
  selectable: true,
  atom: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      alt: {
        default: '',
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'img[src]',
        getAttrs: (element: HTMLElement) => ({
          src: element.getAttribute('src'),
          alt: element.getAttribute('alt'),
        }),
      },
    ]
  },

  renderHTML({ HTMLAttributes }: { HTMLAttributes: Record<string, HTMLAttrs> }) {
    return ['img', mergeAttributes(HTMLAttributes)]
  },

  addCommands() {
    return {
      insertCustomImage:
        (options: { src: string; alt?: string }) =>
        ({ chain }: CommandProps) => {
          return chain()
            .insertContent({
              type: 'paragraph', // 🔹 вставляємо параграф
              content: [
                {
                  type: this.name, // 🔹 усередині — наша картинка
                  attrs: options,
                },
              ],
            })
            .run()
        },
    }
  },
})
