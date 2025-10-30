'use client';

import { useState, useEffect } from 'react';
import Typography from './Typography';
import dayjs, { Dayjs } from 'dayjs';

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

export default function MonthYearPicker({
  id,
  label,
  value,
  onChange,
  error,
}: {
  id: string;
  label: string;
  value?: string; 
  onChange: (val: string) => void;
  error?: string;
}) {
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(
    value && dayjs(value, 'YYYY-MM').isValid() ? dayjs(value, 'YYYY-MM') : null,
  );

  useEffect(() => {
    if (value && dayjs(value, 'YYYY-MM').isValid()) {
      setSelectedDate(dayjs(value, 'YYYY-MM'));
    } else {
      setSelectedDate(null);
    }
  }, [value]);

  const handleChange = (newDate: Dayjs | null) => {
    setSelectedDate(newDate);
    if (newDate) {
      onChange(newDate.format('YYYY-MM'));
    } else {
      onChange('');
    }
  };

  return (
    <div className="flex flex-col gap-1 w-full">
      <label htmlFor={id} className="text-secondary">
        <Typography type="text">{label}</Typography>
      </label>

      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
          views={['year', 'month']} // тільки рік і місяць
          openTo="month"
          value={selectedDate}
          onChange={handleChange}
          format="MMMM YYYY" // наприклад: "жовтень 2025"
          slotProps={{
            textField: {
              id,
              className: `w-full px-3 py-2 rounded-lg border text-primary bg-surface 
                          focus:outline-none focus:ring-2
                          ${
                            error
                              ? 'border-red-500 focus:ring-red-500'
                              : 'border-border focus:ring-primary'
                          }`,
              placeholder: 'Виберіть місяць і рік',
            },
          }}
        />
      </LocalizationProvider>

      {error && <span className="text-sm text-red-500">{error}</span>}
    </div>
  );
}
