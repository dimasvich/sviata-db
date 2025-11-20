import Button from '@/components/ui/Button';
import Typography from '@/components/ui/Typography';
import React, { useState } from 'react';
import InlineTextEditor from '../editor/InlineTextEditor';

interface EditableStringListProps {
  items: string[];
  setItems: (items: string[]) => void;
  label: string;
}

const EditableStringList: React.FC<EditableStringListProps> = ({
  items,
  setItems,
  label,
}) => {
  const [value, setValue] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleAddOrUpdate = () => {
    const trimmed = value.trim();
    if (!trimmed) return;

    if (editingIndex !== null) {
      const updated = [...items];
      updated[editingIndex] = trimmed;
      setItems(updated);
      setEditingIndex(null);
    } else if (!items.includes(trimmed)) {
      setItems([...items, trimmed]);
    }

    setValue('');
  };

  const handleEdit = (item: string, index: number) => {
    setValue(item);
    setEditingIndex(index);
  };

  const handleRemove = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
    if (editingIndex === index) setValue('');
    setEditingIndex(null);
  };

  return (
    <div className="flex flex-col gap-2">
      <Typography type="text">{label}</Typography>
      <div className="flex items-end gap-2">
        <InlineTextEditor
          // placeholder={`Додайте ${label.toLowerCase()}`}
          value={value}
          onChange={(val) => setValue(val)}
        />
        <Button onClick={handleAddOrUpdate}>
          {editingIndex !== null ? 'Оновити' : '+'}
        </Button>
      </div>
      <div className="flex flex-wrap gap-2 mt-1">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center gap-1 bg-border text-primary px-3 py-1 rounded-full text-sm"
          >
            <span
              onClick={() => handleEdit(item, idx)}
              className="cursor-pointer underline"
            >
              {item}
            </span>
            <button
              onClick={() => handleRemove(idx)}
              className="text-red-500 hover:text-red-700"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EditableStringList;
