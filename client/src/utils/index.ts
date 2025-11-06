import dayjs from 'dayjs';

interface GetNthWeekdayOfMonthParams {
  dayOfWeek: string;
  weekOrder: string;
  month: string;
  year?: number;
}

export function getNthWeekdayOfMonth({
  dayOfWeek,
  weekOrder,
  month,
  year = dayjs().year(),
}: GetNthWeekdayOfMonthParams): string {
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

  const dayOfWeekNum = weekdays.findIndex(
    (d) => d.toLowerCase() === dayOfWeek.toLowerCase(),
  );
  const monthNum =
    months.findIndex((m) => m.toLowerCase() === month.toLowerCase()) + 1;
  const weekOrderNum = Number(weekOrder);

  if (dayOfWeekNum === -1 || monthNum === 0 || isNaN(weekOrderNum)) {
    throw new Error('Invalid parameters for getNthWeekdayOfMonth');
  }

  const startOfMonth = dayjs(`${year}-${monthNum}-01`);
  const startDay = startOfMonth.day();

  let dayOffset = dayOfWeekNum - startDay;
  if (dayOffset < 0) dayOffset += 7;

  const resultDate = startOfMonth.add(
    dayOffset + (weekOrderNum - 1) * 7,
    'day',
  );

  return resultDate.format('YYYY-MM-DD');
}

export function getNextThreeYearsForecast(date: string): {
  date: string;
  weekday: string;
}[] {
  const base = dayjs(date, ['YYYY-MM-DD', 'DD-MM-YYYY']);
  if (!base.isValid()) return [];

  const currentYear = dayjs().year();
  const years = [currentYear, currentYear + 1, currentYear + 2];

  return years.map((year) => {
    const d = base.year(year);
    return {
      date: d.format('YYYY-MM-DD'),
      weekday: d.format('dddd'),
    };
  });
}
