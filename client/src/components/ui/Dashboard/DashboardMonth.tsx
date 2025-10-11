import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import 'dayjs/locale/uk';
import Textarea from '../Textarea';
import { baseUrl } from '@/http';
import Button from '../Button';
import Typography from '../Typography';

interface Sviato {
  date: string;
  description: string;
  sviata:
    | {
        id: string;
        name: string;
        document: string;
        tag: string;
      }[]
    | null;
}

export default function DashboardMonth({
  month,
  day,
}: {
  month: number;
  day: number;
}) {
  const router = useRouter();
  const [data, setData] = useState<Sviato[]>([]);
  const [loading, setLoading] = useState(true);
  const [descriptionMap, setDescriptionMap] = useState<Record<string, string>>(
    {},
  );

  dayjs.locale('uk');

  const currentYear = new Date().getFullYear();
  const daysInMonth = new Date(currentYear, month, 0).getDate();
  const monthName = dayjs(`${currentYear}-${month}-01`).format('MMMM');

  const getDayOfWeek = (d: number) =>
    dayjs(`${currentYear}-${month}-${d}`).format('dddd');

  const sviataMap = new Map<string, Sviato>();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${baseUrl}/api/crud/by-month?month=${month}`);
        const json: Sviato[] = await res.json();
        setData(json || []);

        const initialDescription: Record<string, string> = {};
        (json || []).forEach((item) => {
          initialDescription[item.date] = item.description || '';
          sviataMap.set(item.date, item);
        });
        setDescriptionMap(initialDescription);
      } catch (err) {
        console.error('Помилка завантаження:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [month]);

  const saveDescription = async (date: string, description: string) => {
    await fetch(`${baseUrl}/api/crud/update-description`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, description }),
    });
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
              <th className="py-2 px-4 border-b border-border">Опис</th>
              <th className="py-2 px-4 border-b border-border">
                Свято
                <div className="text-sm font-normal text-background/80">
                  Назва / Документ / Тег
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
                  className={`cursor-pointer hover:bg-gray-50 transition
                    ${isEmpty ? 'border-2 border-red-400' : ''} `}
                >
                  <td
                    className={`py-2 px-4 border-b border-border text-center font-medium `}
                  >
                    <div
                      className={`${isSelected ? 'border-primary border-[1px] rounded-[50%] w-fit px-[8px]' : ''}`}
                    >
                      {currentDay}
                    </div>
                  </td>
                  <td className="py-2 px-4 border-b border-border text-center capitalize">
                    {getDayOfWeek(currentDay)}
                  </td>
                  <td className="py-2 px-4 border-b border-border text-center">
                    {sviato?.description ? (
                      <>
                        <Button
                          onClick={() =>
                            saveDescription(dateStr, descriptionMap[dateStr])
                          }
                        >
                          Зберегти опис
                        </Button>
                        <Textarea
                          id={`description-${dateStr}`}
                          label=""
                          maxLength={1000}
                          value={descriptionMap[dateStr] || ''}
                          onChange={(e) =>
                            setDescriptionMap((prev) => ({
                              ...prev,
                              [dateStr]: e.target.value,
                            }))
                          }
                        />
                      </>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="py-2 px-4 border-b border-border text-center align-top">
                    {sviato?.sviata && sviato.sviata.length > 0 ? (
                      <div className="flex flex-col items-start gap-2">
                        {sviato.sviata.map((item, index) => (
                          <div
                            key={index}
                            className="bg-[#dde2ef] p-2 flex justify-between gap-2 rounded-[4px] w-full cursor-pointer hover:bg-[#cfd6e8] flex-1"
                            onClick={() =>
                              router.push(`/add-info?id=${item.id}`)
                            }
                          >
                            <Typography type="text">{index + 1}.</Typography>
                            <div className="flex flex-wrap items-center gap-1">
                              <Typography type="text">{item.name} |</Typography>
                              <div
                                className="text-blue-700 underline cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(
                                    item.document,
                                    '_blank',
                                    'noopener,noreferrer',
                                  );
                                }}
                              >
                                Google Doc
                              </div>
                              <Typography type="text">| #{item.tag}</Typography>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      '-'
                    )}
                  </td>

                  <td className="py-2 px-4 border-b border-border text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push('/create-sviato');
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
