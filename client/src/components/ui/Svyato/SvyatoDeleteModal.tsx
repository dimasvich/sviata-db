'use client';

import { useState } from 'react';
import Modal from '../Modal';
import Button from '../Button';

export default function SvyatoDeleteModal({
  isOpen,
  onClose,
  onDelete,
}: {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
}) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await onDelete();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-primary">
          Ви дійсно хочете видалити цей запис?
        </h2>
        <div className="flex justify-end gap-2">
          <Button onClick={onClose}>Скасувати</Button>
          <Button onClick={handleDelete} type="danger">
            {loading ? 'Видалення...' : 'Так'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
