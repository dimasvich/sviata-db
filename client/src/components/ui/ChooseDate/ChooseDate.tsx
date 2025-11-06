'use client';

import { useEffect, useState } from 'react';
import Calendar from '@/components/ui/Calendar';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { getNthWeekdayOfMonth } from '@/utils';
import Typography from '../Typography';
import dayjs from 'dayjs';
import dayOfYearPlugin from 'dayjs/plugin/dayOfYear';
dayjs.extend(dayOfYearPlugin);

interface ChooseDateProps {
  sviatoDate: string;
  onChangeDate: (date: string) => void;
  setAlternativeDate: (b: boolean) => void;
  alternativeDate: boolean;
  onChangeAlternative?: (data: {
    dayOfWeek: string;
    week: string;
    month: string;
  }) => void;
}

const weekdays = [
  'Понеділок',
  'Вівторок',
  'Середа',
  'Четвер',
  'П’ятниця',
  'Субота',
  'Неділя',
];

const months = [
  'Січень',
  'Лютий',
  'Березень',
  'Квітень',
  'Травень',
  'Червень',
  'Липень',
  'Серпень',
  'Вересень',
  'Жовтень',
  'Листопад',
  'Грудень',
];

export default function ChooseDate({
  sviatoDate,
  onChangeDate,
  onChangeAlternative,
  setAlternativeDate,
  alternativeDate,
}: ChooseDateProps) {
  const [dayOfWeek, setDayOfWeek] = useState('');
  const [week, setWeek] = useState('');
  const [month, setMonth] = useState('');
  const [dayOfYear, setDayOfYear] = useState<string>(''); // 🔹 нове поле для “дня року”

  const handleAlternativeChange = (field: string, value: string) => {
    if (field === 'dayOfWeek') setDayOfWeek(value);
    if (field === 'week') setWeek(value);
    if (field === 'month') setMonth(value);

    if (onChangeAlternative) {
      onChangeAlternative({
        dayOfWeek: field === 'dayOfWeek' ? value : dayOfWeek,
        week: field === 'week' ? value : week,
        month: field === 'month' ? value : month,
      });
    }
  };

  // 🔹 коли всі три поля альтернативної дати заповнені — обчислюємо реальну дату
  useEffect(() => {
    if (dayOfWeek && week && month) {
      const d = getNthWeekdayOfMonth({
        dayOfWeek,
        weekOrder: week,
        month,
      });
      onChangeDate(d);
    }
  }, [dayOfWeek, week, month, onChangeDate]);

  // 🔹 коли заповнено день року — конвертуємо в дату
  useEffect(() => {
    if (dayOfYear) {
      const num = parseInt(dayOfYear);
      if (!isNaN(num) && num >= 1 && num <= 366) {
        const currentYear = new Date().getFullYear();
        const formatted = dayjs()
          .year(currentYear)
          .dayOfYear(num)
          .format('YYYY-MM-DD');
        onChangeDate(formatted);
      }
    }
  }, [dayOfYear, onChangeDate]);

  return (
    <div className="flex gap-2 items-end flex-col">
      {/* Якщо є точна дата */}
      {!alternativeDate && (
        <Calendar
          id="date"
          label="Дата свята*"
          value={sviatoDate}
          onChange={(d) => onChangeDate(d)}
          error=""
        />
      )}

      {/* Якщо альтернативна дата */}
      {alternativeDate && (
        <div className="flex flex-col gap-3 w-full">
          <div className="flex gap-1">
            <Select
              id="dayOfWeek"
              value={dayOfWeek}
              onChange={(v) => handleAlternativeChange('dayOfWeek', v)}
              label="День тижня"
              options={weekdays}
              error=""
            />
            <Select
              id="weekOrder"
              value={week}
              onChange={(v) => handleAlternativeChange('week', v)}
              label="Порядок у місяці"
              options={['1', '2', '3', '4', '5']}
              error=""
            />
            <Select
              id="month"
              value={month}
              onChange={(v) => handleAlternativeChange('month', v)}
              label="Місяць"
              options={months}
              error=""
            />
          </div>

          {/* 🔹 Новий блок: день року */}
          <div className="flex flex-col items-start w-full">
            <Typography type="text">або встановіть день року</Typography>
            <Input
              id="dayOfYear"
              label=""
              type="number"
              value={dayOfYear}
              onChange={(e) => setDayOfYear(e.target.value)}
              placeholder="1–366"
              min={1}
              max={366}
            />
          </div>
        </div>
      )}

      {/* Кнопка перемикання режимів */}
      {!alternativeDate ? (
        <Button onClick={() => setAlternativeDate(true)} type="default">
          Немає точної дати?
        </Button>
      ) : (
        <Button onClick={() => setAlternativeDate(false)} type="default">
          Є точна дата?
        </Button>
      )}
    </div>
  );
}
