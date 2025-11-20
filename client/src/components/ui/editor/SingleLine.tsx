import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from 'prosemirror-state';
import { Step, ReplaceStep } from 'prosemirror-transform';

export const SingleLine = Extension.create({
  name: 'singleLine',

  addKeyboardShortcuts() {
    return {
      Enter: () => true,
      'Shift-Enter': () => true,
    };
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('singleLine'),
        filterTransaction: (tr) => {
          const blockNodes = [
            'paragraph',
            'heading',
            'bulletList',
            'orderedList',
          ];

          for (const step of tr.steps as Step[]) {
            // Ми враховуємо тільки ReplaceStep — лише він несе slice
            if (step instanceof ReplaceStep) {
              const slice = step.slice;

              if (!slice.content) continue;

              for (let i = 0; i < slice.content.childCount; i++) {
                const node = slice.content.child(i);

                if (blockNodes.includes(node.type.name)) {
                  return false; // ❌ Блочні ноди не дозволені
                }
              }
            }
          }

          return true;
        },
      }),
    ];
  },
});
