import { useEffect, useState } from 'react';
import Typography from './Typography';

interface InputProps {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  error?: string;
  min?: number;
  max?: number;
  maxLength?: number | null;
}

export default function Input({
  id,
  label,
  type = 'text',
  placeholder = '',
  value,
  onChange,
  onBlur,
  error,
  min,
  max,
  maxLength = null,
}: InputProps) {
  const [currentLength, setCurrentLength] = useState(value.length);
  const [isOverLimit, setIsOverLimit] = useState(false);

  useEffect(() => {
    setCurrentLength(value.length);
    if (maxLength) {
      setIsOverLimit(value.length > maxLength);
    }
  }, [value, maxLength]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentLength(e.target.value.length);
    if (maxLength) {
      setIsOverLimit(e.target.value.length > maxLength);
    }
    onChange(e);
  };

  return (
    <div className="flex flex-col gap-1 w-full">
      <label htmlFor={id} className="text-secondary">
        <Typography type="text">{label}</Typography>
      </label>

      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        onBlur={onBlur}
        min={min}
        max={max}
        className={`px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 text-primary bg-surface
        ${
          error || isOverLimit
            ? 'border-red-500 focus:ring-red-500'
            : 'border-border focus:ring-primary'
        }`}
      />

      {maxLength && (
        <div className="flex justify-between items-center">
          {error && <span className="text-sm text-red-500">{error}</span>}
          <span
            className={`text-sm ${isOverLimit ? 'text-red-500' : 'text-muted'}`}
          >
            {currentLength}/{maxLength}
          </span>
        </div>
      )}

      {error && <span className="text-sm text-red-500">{error}</span>}
    </div>
  );
}
