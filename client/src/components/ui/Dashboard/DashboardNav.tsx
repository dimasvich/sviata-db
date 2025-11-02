import React, { useState, useEffect, useMemo } from 'react';
import dayjs from 'dayjs';
import dayOfYear from 'dayjs/plugin/dayOfYear';
import 'dayjs/locale/uk';
import { Tooltip, IconButton, Select, MenuItem } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { baseUrl } from '@/http';

dayjs.extend(dayOfYear);
dayjs.locale('uk');

interface DayInfo {
  date: string;
  isFilled: boolean;
}

export default function DashBoardNav({
  year,
  setCurrentDate,
}: {
  year: number;
  setCurrentDate: (date: string) => void;
}) {
  const today = dayjs();
  const savedMode =
    typeof window !== 'undefined' ? localStorage.getItem('viewMode') : null;

  const [viewMode, setViewMode] = useState<'year' | 'month'>(
    savedMode === 'month' ? 'month' : 'year'
  );
  const [month, setMonth] = useState<number>(today.month() + 1);
  const [selectedDay, setSelectedDay] = useState<string>(
    today.year() === year ? today.format('YYYY-MM-DD') : `${year}-01-01`
  );
  const [daysData, setDaysData] = useState<Record<string, DayInfo>>({});

  const totalDays =
    viewMode === 'year'
      ? dayjs(`${year}-12-31`).dayOfYear()
      : new Date(year, month, 0).getDate();

  const days = useMemo(() => {
    if (viewMode === 'year') {
      return Array.from({ length: totalDays }, (_, i) =>
        dayjs(`${year}-01-01`).add(i, 'day')
      );
    } else {
      return Array.from({ length: totalDays }, (_, i) =>
        dayjs(`${year}-${month.toString().padStart(2, '0')}-01`).add(i, 'day')
      );
    }
  }, [year, totalDays, viewMode, month]);

  useEffect(() => {
    localStorage.setItem('viewMode', viewMode);
  }, [viewMode]);

  useEffect(() => {
    setCurrentDate(selectedDay);
  }, [selectedDay, setCurrentDate]);

  useEffect(() => {
    const start = days[0]?.format('YYYY-MM-DD');
    const end = days[days.length - 1]?.format('YYYY-MM-DD');
    if (!start || !end) return;

    const fetchData = async () => {
      try {
        const res = await fetch(
          `${baseUrl}/api/day/status?year=${year}`
        );
        const json: DayInfo[] = await res.json();
        const map: Record<string, DayInfo> = {};
        json.forEach((item) => {
          map[item.date] = item;
        });
        setDaysData(map);
      } catch (err) {
        console.error('Помилка завантаження:', err);
      }
    };

    fetchData();
  }, [year, days]);

  const handleSelect = (dateStr: string) => {
    setSelectedDay(dateStr);
    setCurrentDate(dateStr);
  };

  const handlePrevMonth = () => {
    setMonth((prev) => (prev === 1 ? 12 : prev - 1));
  };

  const handleNextMonth = () => {
    setMonth((prev) => (prev === 12 ? 1 : prev + 1));
  };

  return (
    <div className="w-full flex flex-col items-center gap-3 bg-background p-4 border border-border rounded-2xl shadow-sm">
      <div className="flex items-center gap-4 mb-2">
        <button
          className={`px-3 py-1 rounded-lg border ${
            viewMode === 'year'
              ? 'bg-primary text-white border-primary'
              : 'bg-surface hover:bg-accent hover:text-white border-accent'
          }`}
          onClick={() => setViewMode('year')}
        >
          Весь рік
        </button>

        <button
          className={`px-3 py-1 rounded-lg border ${
            viewMode === 'month'
              ? 'bg-primary text-white border-primary'
              : 'bg-surface hover:bg-accent hover:text-white border-accent'
          }`}
          onClick={() => setViewMode('month')}
        >
          Поточний місяць
        </button>

        {viewMode === 'month' && (
          <Select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            size="small"
            sx={{ minWidth: 120, background: 'white', borderRadius: '8px' }}
          >
            {Array.from({ length: 12 }).map((_, i) => (
              <MenuItem key={i} value={i + 1}>
                {dayjs(`${year}-${i + 1}-01`).format('MMMM')}
              </MenuItem>
            ))}
          </Select>
        )}
      </div>

      <div className="flex flex-col items-center">
        {viewMode === 'month' && (
          <div className="flex items-center gap-2 mb-2">
            <IconButton onClick={handlePrevMonth} size="small">
              <ChevronLeft />
            </IconButton>
            <span className="font-medium">
              {dayjs(`${year}-${month}-01`).format('MMMM YYYY')}
            </span>
            <IconButton onClick={handleNextMonth} size="small">
              <ChevronRight />
            </IconButton>
          </div>
        )}

        <div
          className={`flex flex-wrap justify-center gap-[2px] ${
            viewMode === 'year' ? 'max-h-[600px] overflow-y-auto' : ''
          }`}
        >
          {days.map((date) => {
            const dateStr = date.format('YYYY-MM-DD');
            const isSelected = selectedDay === dateStr;
            const isEmpty = daysData[dateStr]?.isFilled === false;

            return (
              <Tooltip
                key={dateStr}
                title={date.format('D MMMM YYYY')}
                arrow
                placement="top"
              >
                <button
                  onClick={() => handleSelect(dateStr)}
                  className={`w-10 h-10 flex flex-col items-center justify-center 
                    text-[10px] font-medium rounded-md border transition-all duration-150
                    ${
                      isSelected
                        ? 'bg-primary text-white border-primary shadow'
                        : isEmpty
                        ? 'bg-red-100 text-red-700 border-red-400'
                        : 'bg-surface text-secondary hover:bg-accent hover:text-white border-accent'
                    }
                  `}
                >
                  <span>{date.format('YYYY-DD-MM')}</span>
                </button>
              </Tooltip>
            );
          })}
        </div>
      </div>
    </div>
  );
}
