import * as cheerio from 'cheerio';
import * as dayjs from 'dayjs';
import 'dayjs/locale/uk';

dayjs.locale('uk');

export function getNext5YearsForecast(date: string): {
  year: number;
  date: string;
  weekday: string;
}[] {
  const base = dayjs(date, ['YYYY-MM-DD', 'DD-MM-YYYY']);
  if (!base.isValid()) return [];

  const currentYear = dayjs().year();
  const years = [0, 1, 2, 3, 4].map((i) => currentYear + i);

  return years.map((year) => {
    const d = base.year(year);
    return {
      year,
      date: d.format('D MMMM'),
      weekday: d.format('dddd'),
    };
  });
}
export function capitalizeFirstLetter(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
export function removeBisSkinChecked(html: string): string {
  const $ = cheerio.load(html);

  $('[bis_skin_checked]').each((_, el) => {
    $(el).removeAttr('bis_skin_checked');
  });
  $('p').each((_, el) => {
    if (!$(el).text().trim()) {
      $(el).remove();
    }
  });
  return $.html();
}
