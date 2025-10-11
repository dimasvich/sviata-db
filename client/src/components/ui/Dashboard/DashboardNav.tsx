import React, { useState, useEffect, useMemo } from 'react';
import dayjs from 'dayjs';
import dayOfYear from 'dayjs/plugin/dayOfYear';
import 'dayjs/locale/uk';
import { Tooltip, IconButton } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { baseUrl } from '@/http';

dayjs.extend(dayOfYear);
dayjs.locale('uk');

interface DayInfo {
  dayOfMonth: number;
  year: number;
  month: number;
  date: string;
  dayOfYear: number;
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
  const [selectedDay, setSelectedDay] = useState<string>(() =>
    today.year() === year ? today.format('YYYY-MM-DD') : `${year}-01-01`,
  );
  const [startIndex, setStartIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(0);
  const [daysData, setDaysData] = useState<Record<string, DayInfo>>({});

  const totalDays = dayjs(`${year}-12-31`).dayOfYear();

  const days = useMemo(
    () =>
      Array.from({ length: totalDays }, (_, i) =>
        dayjs(`${year}-01-01`).add(i, 'day'),
      ),
    [year, totalDays],
  );

  useEffect(() => {
    const calcVisible = () => {
      const cellWidth = 70;
      const available = window.innerWidth - 160;
      setVisibleCount(Math.floor(available / cellWidth));
    };
    calcVisible();
    window.addEventListener('resize', calcVisible);
    return () => window.removeEventListener('resize', calcVisible);
  }, []);

  useEffect(() => {
    if (visibleCount === 0) return;
    const currentIndex = days.findIndex(
      (d) => d.format('YYYY-MM-DD') === selectedDay,
    );
    if (currentIndex < 0) return;

    const center = Math.max(currentIndex - Math.floor(visibleCount / 2), 0);
    const maxStart = Math.max(totalDays - visibleCount, 0);
    setStartIndex(Math.min(center, maxStart));
  }, [selectedDay, visibleCount, totalDays, days]);

  useEffect(() => {
    setCurrentDate(selectedDay);
  }, [selectedDay, setCurrentDate]);

  useEffect(() => {
    if (visibleCount === 0) return;

    const startDay = days[startIndex];
    const endDay = days[startIndex + visibleCount - 1];

    if (!startDay || !endDay) return;

    const start = startDay.format('YYYY-MM-DD');
    const end = endDay.format('YYYY-MM-DD');

    const fetchData = async () => {
      try {
        const res = await fetch(
          `${baseUrl}/api/crud/day-info?start=${start}&end=${end}&year=${year}`,
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
  }, [startIndex, visibleCount, year, days]);

  const handleNext = () => {
    setStartIndex((prev) =>
      Math.min(prev + visibleCount, totalDays - visibleCount),
    );
  };

  const handlePrev = () => {
    setStartIndex((prev) => Math.max(prev - visibleCount, 0));
  };

  const handleSelect = (dateStr: string) => {
    setSelectedDay(dateStr);
    setCurrentDate(dateStr);
  };

  const visibleDays = days.slice(startIndex, startIndex + visibleCount);

  return (
    <div className="w-full flex items-center justify-center gap-2 bg-background p-4 border border-border rounded-2xl shadow-sm">
      <IconButton
        onClick={handlePrev}
        disabled={startIndex === 0}
        size="small"
        sx={{ color: startIndex === 0 ? '#9CA3AF' : '#111827' }}
      >
        <ChevronLeft />
      </IconButton>

      <div className="flex overflow-hidden gap-[2px]">
        {visibleDays.map((date) => {
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
                className={`w-16 h-12 flex flex-col items-center justify-center 
                  text-[11px] font-medium rounded-md border transition-all duration-150
                  ${
                    isSelected
                      ? 'bg-primary text-white border-primary shadow'
                      : isEmpty
                        ? 'bg-red-100 text-red-700 border-red-400'
                        : 'bg-surface text-secondary hover:bg-accent hover:text-white border-accent'
                  }
                `}
              >
                <span>{date.format('D')}</span>
                <span className="text-[10px] text-muted">
                  {date.format('MMM')}
                </span>
              </button>
            </Tooltip>
          );
        })}
      </div>

      <IconButton
        onClick={handleNext}
        disabled={startIndex + visibleCount >= totalDays}
        size="small"
        sx={{
          color: startIndex + visibleCount >= totalDays ? '#9CA3AF' : '#111827',
        }}
      >
        <ChevronRight />
      </IconButton>
    </div>
  );
}
