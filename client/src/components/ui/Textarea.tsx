import Typography from './Typography';
import { useEffect, useState } from 'react';

export default function Textarea({
  id,
  label,
  placeholder = '',
  value,
  onChange,
  error,
  rows = 4,
  maxLength = 250,
}: {
  id: string;
  label: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  error?: string;
  rows?: number;
  maxLength?: number;
}) {
  const [currentLength, setCurrentLength] = useState(value.length);
  useEffect(() => {
    setCurrentLength(value.length);
  }, [value]);
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value.length <= maxLength) {
      setCurrentLength(e.target.value.length);
      onChange(e);
    }
  };

  return (
    <div className="flex flex-col gap-1 w-full">
      <label htmlFor={id} className="text-secondary">
        <Typography type="text">{label}</Typography>
      </label>

      <textarea
        id={id}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        rows={rows}
        maxLength={maxLength}
        className={`px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 text-primary bg-surface resize-y
          ${error ? 'border-red-500 focus:ring-red-500' : 'border-border focus:ring-primary'}`}
      />

      <div className="flex justify-between items-center">
        {error && <span className="text-sm text-red-500">{error}</span>}
        <span className="text-sm text-muted">
          {currentLength}/{maxLength}
        </span>
      </div>
    </div>
  );
}
