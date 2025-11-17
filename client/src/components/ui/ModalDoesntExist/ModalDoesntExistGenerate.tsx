'use client';

import { useState } from 'react';
import Typography from '../Typography';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import ChooseDate from '../ChooseDate/ChooseDate';

interface ModalAddHolidayProps {
  tags: string[];
  onConfirm: (data: { date: string; tags: string[] }) => void;
  onCancel: () => void;
  sviatoName: string;
  setSviatoName: (s: string) => void;
}

export default function ModalAddHoliday({
  tags,
  onConfirm,
  onCancel,
  sviatoName,
  setSviatoName,
}: ModalAddHolidayProps) {
  const [sviatoDate, setSviatoDate] = useState('');
  const [alternativeDate, setAlternativeDate] = useState(false);

  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  function handleAddTag() {
    if (!newTag.trim()) return;
    if (!selectedTags.includes(newTag)) {
      setSelectedTags((prev) => [...prev, newTag]);
    }
    setNewTag('');
  }

  function handleSubmit() {
    if (!sviatoDate.trim()) return;

    onConfirm({
      date: sviatoDate,
      tags: selectedTags,
    });
  }

  return (
    <div className="p-5 bg-surface rounded-xl shadow-xl border border-border min-w-[600px] w-full max-w-lg">
      <Typography type="title">Додати нове свято</Typography>

      <div className="flex flex-col gap-4 mt-4">
        <Input
          id="name"
          label="Офіційна назва свята (Н1)"
          value={sviatoName}
          onChange={(e) => setSviatoName(e.target.value)}
        />
        <ChooseDate
          sviatoDate={sviatoDate}
          onChangeDate={setSviatoDate}
          alternativeDate={alternativeDate}
          setAlternativeDate={setAlternativeDate}
        />

        <div className="flex flex-col gap-2">
          <Typography type="text">Теги</Typography>

          <div className="flex items-end gap-2">
            <Select
              id="newTag"
              label="Тег"
              value={newTag}
              onChange={(v) => setNewTag(v)}
              options={tags}
              error=""
            />
            <Button onClick={handleAddTag}>+</Button>
          </div>

          {selectedTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedTags.map((t) => (
                <span
                  key={t}
                  className="px-2 py-1 bg-primary text-surface rounded-lg text-sm"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button type="default" onClick={onCancel}>
            Скасувати
          </Button>

          <Button onClick={handleSubmit}>Додати свято</Button>
        </div>
      </div>
    </div>
  );
}
