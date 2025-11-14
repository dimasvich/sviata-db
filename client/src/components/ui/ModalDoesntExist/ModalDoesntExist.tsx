import React from 'react';

type ModalDoesntExistProps = {
  title: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ModalDoesntExist({
  title,
  onConfirm,
  onCancel,
}: ModalDoesntExistProps) {
  return (
    <div className="bg-surface rounded-lg p-4 border border-border shadow-md">
      <h2 className="text-sm font-semibold text-primary mb-2">
        Свято {title} не знайдено
      </h2>

      <p className="text-secondary text-sm mb-4">Додати це свято як нове?</p>

      <div className="flex justify-end gap-2">
        <button
          className="
            px-3 py-1.5 rounded-md
            bg-border text-primary 
            hover:bg-muted hover:text-surface
            transition
            text-sm
          "
          onClick={onCancel}
        >
          Скасувати
        </button>

        <button
          className="
            px-3 py-1.5 rounded-md
            bg-primary text-surface 
            hover:bg-blue-700
            transition
            text-sm
          "
          onClick={onConfirm}
        >
          Додати
        </button>
      </div>
    </div>
  );
}
