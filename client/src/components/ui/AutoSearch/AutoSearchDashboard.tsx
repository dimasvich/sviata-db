'use client';
import { SearchItem } from '@/types';
import { useState } from 'react';
import Typography from '../Typography';

interface AutoSearchProps {
  id: string;
  label: string;
  placeholder?: string;
  value: string;
  results: SearchItem[];
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelect: (item: SearchItem) => void;
  setLoader?: (s: boolean) => void;
  error?: string;
}

export default function AutoSearchDashboard({
  label,
  placeholder = '',
  value,
  results,
  onChange,
  onSelect,
  error,
}: AutoSearchProps) {
  const [focused, setFocused] = useState(false);

  const showResults = focused;

  return (
    <>
      <div className="relative w-full">
        <label className="text-secondary block mb-1">
          <Typography type="text">{label}</Typography>
        </label>

        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          className={`px-3 py-2 w-full rounded-lg border focus:outline-none focus:ring-2 text-primary bg-surface
          ${error ? 'border-red-500 focus:ring-red-500' : 'border-border focus:ring-primary'}`}
        />

        {error && <span className="text-sm text-red-500">{error}</span>}

        {showResults && (
          <ul className="absolute z-10 w-full bg-white border border-border rounded-lg mt-1 shadow-lg max-h-56 overflow-y-auto">
            {results.map((item) => (
              <li
                key={item._id}
                onClick={() => onSelect(item)}
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-primary"
              >
                {item.name}
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
