import dayjs from 'dayjs';
import { create } from 'zustand';

type DateState = {
  date: string;
  setDate: (newDate: string) => void;
  month: number;
  setMonth: (newMonth: number) => void;
};

export const useDayStore = create<DateState>((set) => ({
  date: dayjs().format('YYYY-MM-DD'),
  setDate: (newDate) => set({ date: newDate }),
  month: dayjs().month() + 1,
  setMonth: (newMonth) => set({ month: newMonth }),
}));
