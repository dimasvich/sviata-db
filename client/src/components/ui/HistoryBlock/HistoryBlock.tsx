import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Typography from '@/components/ui/Typography';
import DefaultTextEditor from '../editor/DefaultTextEditor';

export interface TimelineItem {
  year: string;
  html: string;
}

interface EditableTimelineProps {
  timeline: TimelineItem[];
  setTimeline: (timeline: TimelineItem[]) => void;
  label?: string;
}

const EditableTimeline: React.FC<EditableTimelineProps> = ({
  timeline,
  setTimeline,
  label = 'Таймлайн',
}) => {
  const [year, setYear] = useState('');
  const [html, setHtml] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleAddOrUpdate = () => {
    const trimmedYear = year.trim();
    const trimmedHtml = html.trim();
    if (!trimmedYear || !trimmedHtml) return;

    if (editingIndex !== null) {
      const updated = [...timeline];
      updated[editingIndex] = { year: trimmedYear, html: trimmedHtml };
      setTimeline(updated);
      setEditingIndex(null);
    } else {
      setTimeline([...timeline, { year: trimmedYear, html: trimmedHtml }]);
    }

    setYear('');
    setHtml('');
  };

  const handleEdit = (item: TimelineItem, index: number) => {
    setYear(item.year);
    setHtml(item.html);
    setEditingIndex(index);
  };

  const handleRemove = (index: number) => {
    setTimeline(timeline.filter((_, i) => i !== index));
    if (editingIndex === index) {
      setYear('');
      setHtml('');
      setEditingIndex(null);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <Typography type="text">{label}</Typography>
        <Button onClick={handleAddOrUpdate}>
          {editingIndex !== null ? 'Оновити' : '+'}
        </Button>
      </div>
      <div className="flex flex-col gap-2">
        <Input
          id="timelineYear"
          label=""
          placeholder="Рік"
          value={year}
          onChange={(e) => setYear(e.target.value)}
        />
        <DefaultTextEditor value={html} onChange={(val) => setHtml(val)} />
        {/* <Textarea
          id="timelineHtml"
          label=""
          maxLength={500}
          placeholder="Текст (HTML)"
          value={html}
          onChange={(e) => setHtml(e.target.value)}
        /> */}
      </div>
      <div className="flex flex-wrap gap-2 mt-1">
        {timeline.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center gap-2 bg-border text-primary px-3 py-1 rounded-full text-sm"
          >
            <span
              onClick={() => handleEdit(item, idx)}
              className="cursor-pointer underline"
            >
              {item.year}: {item.html}
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

export default EditableTimeline;
