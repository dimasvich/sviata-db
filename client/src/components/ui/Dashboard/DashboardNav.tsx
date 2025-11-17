import IconOpenAI from '@/components/svg/IconOpenAI';
import { baseUrl } from '@/http';
import { apiFetch } from '@/http/api';
import { SearchItem } from '@/types';
import { openNewTab } from '@/utils';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { IconButton, MenuItem, Select, Tooltip } from '@mui/material';
import dayjs from 'dayjs';
import 'dayjs/locale/uk';
import dayOfYear from 'dayjs/plugin/dayOfYear';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import AutoSearchDashboard from '../AutoSearch/AutoSearchDashboard';

dayjs.extend(dayOfYear);
dayjs.locale('uk');

interface DayInfo {
  date: string;
  status: string;
}
export default function DashBoardNav({
  year,
  setCurrentDate,
  setMonthCurrent,
  daysData,
  date,
}: {
  year: number;
  setCurrentDate: (date: string) => void;
  setMonthCurrent: (m: number) => void;
  daysData: Record<string, DayInfo>;
  date: string;
}) {
  const today = dayjs();
  const router = useRouter();
  const savedMode =
    typeof window !== 'undefined' ? localStorage.getItem('viewMode') : null;

  const [viewMode, setViewMode] = useState<'year' | 'month'>(
    savedMode === 'month' ? 'month' : 'year',
  );
  const [month, setMonth] = useState<number>(today.month() + 1);
  const [selectedDay, setSelectedDay] = useState<string>(
    today.year() === year ? today.format('YYYY-MM-DD') : `${year}-01-01`,
  );
  const [search, setSearch] = useState('');
  const [searchList, setSearchList] = useState<SearchItem[]>([]);
  const [searchItem, setSearchItem] = useState<SearchItem | null>(null);
  const totalDays =
    viewMode === 'year'
      ? dayjs(`${year}-12-31`).dayOfYear()
      : new Date(year, month, 0).getDate();

  const days = useMemo(() => {
    if (viewMode === 'year') {
      return Array.from({ length: totalDays }, (_, i) =>
        dayjs(`${year}-01-01`).add(i, 'day'),
      );
    } else {
      return Array.from({ length: totalDays }, (_, i) =>
        dayjs(`${year}-${month.toString().padStart(2, '0')}-01`).add(i, 'day'),
      );
    }
  }, [year, totalDays, viewMode, month]);
  useEffect(() => {
    if (date) {
      setSelectedDay(date);
      setMonth(dayjs(date).month() + 1);
    }
  }, []);
  useEffect(() => {
    localStorage.setItem('viewMode', viewMode);
  }, [viewMode]);

  useEffect(() => {
    setCurrentDate(selectedDay);
  }, [selectedDay]);

  useEffect(() => {
    if (!month) return;
    setMonthCurrent(month);
  }, [month]);
  useEffect(() => {
    if (!date) return;
    setMonthCurrent(dayjs(date).month() + 1);
  }, [date]);

  const handleNav = (dateStr: string) => {
    const el = document.getElementById(`row-${dateStr}`);
    if (el) {
      el.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };
  useEffect(() => {
    if (!search.length) return;
    const fetchData = async () => {
      const res = await apiFetch(`${baseUrl}/api/crud/search?query=${search}`);
      if (!res.ok) return;
      const json = await res.json();

      setSearchList(json);
    };
    fetchData();
  }, [search]);
  const handleSelect = (dateStr: string) => {
    setSelectedDay(dateStr);
    handleNav(dateStr);
  };

  const handlePrevMonth = () => {
    setMonth((prev) => (prev === 1 ? 12 : prev - 1));
  };

  const handleNextMonth = () => {
    setMonth((prev) => (prev === 12 ? 1 : prev + 1));
  };

  const selectItem = (item: SearchItem) => {
    setSearchItem(item);
    setSearch(item.name);
    setSearchList([]);
    openNewTab(`/add-info?id=${item._id}`);
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

            return (
              <Tooltip
                key={dateStr}
                title={date.format('D MMMM YYYY')}
                arrow
                placement="top"
              >
                <button
                  onClick={() => handleSelect(dateStr)}
                  className={`w-10 h-13 flex flex-col items-center justify-center 
                    text-[10px] font-medium rounded-md border transition-all duration-150
                    ${
                      isSelected
                        ? 'bg-primary text-white border-primary shadow'
                        : daysData[dateStr]?.status === 'EMPTY'
                          ? 'bg-red-100 y-[15px] text-red-700 border-red-400'
                          : daysData[dateStr]?.status === 'PARTIAL'
                            ? 'bg-surface text-secondary hover:bg-accent hover:text-white border-accent'
                            : daysData[dateStr]?.status === 'FILLED'
                              ? 'bg-accent text-secondary hover:bg-accent hover:text-white border-accent'
                              : daysData[dateStr]?.status === 'OPENAI'
                                ? 'bg-[#ffa500] text-secondary hover:bg-[#ed9900] hover:text-white border-[#ed9900]'
                                : ''
                    }
                  `}
                >
                  <span>
                    {date.format('YYYY-DD-MM')}{' '}
                    {daysData[dateStr]?.status === 'OPENAI' ? (
                      <IconOpenAI />
                    ) : (
                      ''
                    )}
                  </span>
                </button>
              </Tooltip>
            );
          })}
        </div>
      </div>
      <AutoSearchDashboard
        id={'search'}
        label={'Пошук свят по H1'}
        value={search}
        results={searchList}
        onChange={(e) => setSearch(e.target.value)}
        onSelect={(item) => selectItem(item)}
      />
    </div>
  );
}
