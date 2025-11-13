'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Typography from '@/components/ui/Typography';
import ImageUpload from '@/components/ui/ImageUpload';
import { DayType, WhoWasBornTodayItem } from '@/types';
import { baseUrl } from '@/http';

interface WhoWasBornTodayProps {
  day: DayType;
  handleChange: (
    field: string,
    value: string | boolean | WhoWasBornTodayItem[] | WhoWasBornTodayItem,
  ) => void;
}

export default function WhoWasBornTodaySection({
  day,
  handleChange,
}: WhoWasBornTodayProps) {
  const [form, setForm] = useState({
    year: '',
    title: '',
    html: '',
    file: null as File | null,
    files: [] as File[],
    preview: '',
  });

  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleFormChange = (field: string, value: string | File) => {
    if (field === 'file' && value instanceof File) {
      const previewUrl = URL.createObjectURL(value);
      setForm((prev) => ({
        ...prev,
        file: value,
        files: [...prev.files, value],
        preview: previewUrl,
      }));
    } else {
      setForm((prev) => ({ ...prev, [field]: value }));
    }
  };

  const resetForm = () => {
    setForm({
      year: '',
      title: '',
      html: '',
      file: null,
      files: [],
      preview: '',
    });
    setEditingIndex(null);
  };

  const handleAddOrUpdate = () => {
    const { title, html, year, file } = form;
    if (!title.trim() || !html.trim()) return;

    const updated = [...day.whoWasBornToday];

    if (editingIndex !== null) {
      const existing = updated[editingIndex];
      updated[editingIndex] = {
        ...existing,
        title,
        html,
        year,
        image: file ? file.name : existing.image,
      };
    } else {
      if (!file) return;
      updated.push({
        title,
        html,
        year,
        image: file.name,
      });
    }

    handleChange('whoWasBornToday', updated);
    resetForm();
  };
  const handleEdit = (idx: number) => {
    const item = day.whoWasBornToday[idx];
    setForm({
      year: item.year || '',
      title: item.title,
      html: item.html,
      file: null,
      files: [],
      preview: item.image || '',
    });
    setEditingIndex(idx);
  };

  const handleRemove = (idx: number) => {
    const updated = day.whoWasBornToday.filter((_, i) => i !== idx);
    handleChange('whoWasBornToday', updated);
    if (editingIndex === idx) resetForm();
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <Typography type="text">Хто народився у цей день</Typography>
        <div className="flex gap-2">
          {editingIndex !== null && (
            <Button type="danger" onClick={resetForm}>
              Скасувати
            </Button>
          )}
          <Button onClick={handleAddOrUpdate}>
            {editingIndex !== null ? 'Зберегти' : '+'}
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Input
          id="whoYear"
          placeholder="Рік народження"
          value={form.year}
          onChange={(e) => handleFormChange('year', e.target.value)}
          label=""
        />
        <Input
          id="whoTitle"
          placeholder="Ім’я"
          value={form.title}
          onChange={(e) => handleFormChange('title', e.target.value)}
          label=""
        />
        <Textarea
          label=""
          id="whoHtml"
          placeholder="Текст (HTML)"
          maxLength={500}
          value={form.html}
          onChange={(e) => handleFormChange('html', e.target.value)}
        />

        <div className="flex items-center gap-4">
          <ImageUpload
            onFileSelect={(file) => handleFormChange('file', file)}
            previewImg={
              form.preview?.startsWith('blob:')
                ? form.preview
                : form.preview
                  ? `${baseUrl}/uploads/${day.date}/whoWasBorn/${form.preview}`
                  : null
            }
          />
        </div>

        <div className="flex flex-wrap gap-2 mt-1">
          {day.whoWasBornToday.map((item, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm cursor-pointer ${
                editingIndex === idx
                  ? 'bg-blue-200 text-blue-800'
                  : 'bg-border text-primary hover:bg-muted'
              }`}
              onClick={() => handleEdit(idx)}
            >
              <p>
                {item.year ? `${item.year} — ` : ''}
                {item.title}
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(idx);
                }}
                className="text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
