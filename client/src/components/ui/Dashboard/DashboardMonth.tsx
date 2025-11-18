import { baseUrl } from '@/http';
import { apiFetch } from '@/http/api';
import dayjs from 'dayjs';
import 'dayjs/locale/uk';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Typography from '../Typography';
import TrueFalseMark from '../Marks/TrueFalseMark';

interface Sviato {
  date: string;
  description: string;
  dateUpload: string;
  sviata: {
    id: string;
    name: string;
    hasDescription: boolean;
    hasLeaflets: boolean;
    tags: string[];
    images: number;
  }[];
}

export default function DashboardMonth({
  month,
  day,
  date,
}: {
  month: number;
  day: number;
  date: string;
}) {
  const router = useRouter();
  const [data, setData] = useState<Sviato[]>([]);
  const [loading, setLoading] = useState(true);

  dayjs.locale('uk');

  const currentYear = new Date().getFullYear();
  const daysInMonth = new Date(currentYear, month, 0).getDate();
  const monthName = dayjs(`${currentYear}-${month}-01`).format('MMMM');

  const getDayOfWeek = (d: number) =>
    dayjs(`${currentYear}-${month}-${d}`).format('dd');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await apiFetch(
          `${baseUrl}/api/day/by-month?month=${month}`,
        );
        const json: Sviato[] = await res.json();
        setData(json || []);
      } catch (err) {
        console.error('Помилка завантаження:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [month]);

  const createNew = async (dateStr: string) => {
    const res = await apiFetch(`${baseUrl}/api/crud`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: dateStr }),
    });
    const json = await res.json();
    router.push(`/add-info?id=${json._id}`);
  };

  if (loading)
    return <p className="text-center text-secondary">Завантаження...</p>;

  return (
    <div className="p-6 bg-background min-h-screen">
      <h2 className="text-2xl font-semibold text-primary mb-4 capitalize">
        Таблиця за {monthName}
      </h2>

      <div className="overflow-x-auto rounded-2xl shadow">
        <table className="min-w-full bg-surface border border-border">
          <thead className="bg-primary text-white">
            <tr>
              <th className="py-2 px-4 border-b border-border">Дата</th>
              <th className="py-2 px-4 border-b border-border">День тижня</th>
              <th className="py-2 px-4 border-b border-border">
                Останнє вивантаження
              </th>
              <th className="py-2 px-4 border-b border-border">Опис</th>
              <th className="py-2 px-4 border-b border-border">
                Свято
                <div className="text-sm font-normal text-background/80">
                  Назва / Тег / Текст про свято / Кількість фото / Листівки
                </div>
              </th>
              <th className="py-2 px-4 border-b border-border text-center">
                Дії
              </th>
            </tr>
          </thead>

          <tbody>
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const currentDay = i + 1;
              const dateStr = `${currentYear}-${month
                .toString()
                .padStart(2, '0')}-${currentDay.toString().padStart(2, '0')}`;
              const sviato = data.find((item) => item.date === dateStr);

              const isEmpty = !sviato || !sviato.description;
              const isSelected = currentDay === day;

              return (
                <tr
                  key={currentDay}
                  id={`row-${dateStr}`}
                  onClick={() => router.push(`/add-info-day?date=${dateStr}`)}
                  className={`cursor-pointer hover:bg-gray-50 transition ${
                    isEmpty ? 'border-2 border-red-400' : ''
                  }`}
                >
                  <td className="py-2 px-4 border-b border-border text-center font-medium align-top">
                    <div
                      className={`${
                        isSelected
                          ? 'border-primary border-[1px] rounded-[12px] min-w-[120px] px-[8px]'
                          : ''
                      }`}
                    >
                      {dateStr}
                    </div>
                  </td>

                  <td className="py-2 px-4 border-b border-border text-center capitalize align-top">
                    {getDayOfWeek(currentDay)}
                  </td>
                  <td className="py-2 px-4 border-b border-border text-center font-medium align-top">
                    {sviato?.dateUpload || ''}
                  </td>

                  <td className="py-2 px-4 border-b border-border max-w-md h-auto text-left align-top">
                    {(() => {
                      if (!sviato?.description) return '-';

                      const match =
                        sviato.description.match(/<p[^>]*>(.*?)<\/p>/i);
                      return match ? (
                        <span dangerouslySetInnerHTML={{ __html: match[0] }} />
                      ) : (
                        '-'
                      );
                    })()}
                  </td>

                  <td className="py-2 px-4 border-b border-border text-center align-top">
                    {sviato?.sviata && sviato.sviata.length > 0 ? (
                      <div className="flex flex-col items-start gap-2">
                        {sviato.sviata.map((item, index) => (
                          <Link
                            key={index}
                            href={`/add-info?id=${item.id}`}
                            target="_blank"
                          >
                            <div className="bg-[#dde2ef] p-2 flex justify-between gap-2 rounded-[4px] w-full cursor-pointer hover:bg-[#cfd6e8] flex-1">
                              <Typography type="text">{index + 1}.</Typography>
                              <div className="flex flex-wrap items-center gap-1">
                                <Typography type="text">
                                  {item.name} |
                                </Typography>
                                <Typography type="text">
                                  #{item.tags.map((item) => item)} | 
                                </Typography>
                                <Typography type="text">
                                  <TrueFalseMark value={item.hasDescription} /> | 
                                </Typography>
                                <Typography type="text">
                                  {item.images} фото | 
                                </Typography>
                                <Typography type="text">
                                  <TrueFalseMark value={item.hasLeaflets} />
                                </Typography>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      '-'
                    )}
                  </td>

                  <td className="py-2 px-4 border-b border-border text-center align-top">
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        await createNew(dateStr);
                      }}
                      className="px-3 py-1 bg-accent text-white rounded-xl hover:bg-green-600 transition"
                    >
                      +
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
