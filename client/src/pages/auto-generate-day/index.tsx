import Button from '@/components/ui/Button';
import Calendar from '@/components/ui/Calendar';
import Layout from '@/components/ui/Layout';
import Loader from '@/components/ui/Loader';
import Typography from '@/components/ui/Typography';
import { baseUrl } from '@/http';
import { apiFetch } from '@/http/api';
import { getNthWeekdayOfMonth } from '@/utils';
import dayjs from 'dayjs';
import localeData from 'dayjs/plugin/localeData';
import Head from 'next/head';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AutoGeneratePage() {
  const [dayOfWeek, setDayOfWeek] = useState('');
  const [week, setWeek] = useState('');
  const [month, setMonth] = useState('');
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [alternativeDate, setAlternativeDate] = useState(false);

  const router = useRouter();

  useEffect(() => {
    if (dayOfWeek.length && month.length && week.length) {
      const d = getNthWeekdayOfMonth({ dayOfWeek, weekOrder: week, month });
      setDate(d);
    }
  }, [dayOfWeek, month, week]);

  const handleGenerate = async () => {
    if (!date) return;

    setLoading(true);

    try {
      const res = await apiFetch(`${baseUrl}/api/generate-from-csv/day/${date}`, {
        method: 'POST',
      });

      if (!res.ok) {
        throw new Error(`Помилка при запиті: ${res.status}`);
      }
    } finally {
      setLoading(false);
      setDate('');
    }
  };
  dayjs.extend(localeData);

  return (
    <>
      <Head>
        <title>Sviato-db | Генерувати день по даті</title>
        <meta name="description" content="Генерувати день по даті" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Layout>
        <>
          {!loading ? (
            <div className="min-h-[80vh] w-full flex items-center justify-center bg-background">
              <div className="bg-surface w-full max-w-2xl rounded-2xl shadow-lg p-10 border border-border">
                <div className="flex flex-col items-center text-center gap-6">
                  <Typography
                    type="title"
                    className="text-primary text-3xl font-semibold"
                  >
                    Генерувати день по даті
                  </Typography>

                  <div className="flex flex-col gap-6 w-full mt-4">
                    <div className="flex gap-2 items-end flex-col">
                      {!alternativeDate && (
                        <Calendar
                          id="date"
                          label="Дата*"
                          value={date}
                          onChange={(d) => setDate(d)}
                          error={''}
                        />
                      )}
                      {/* {alternativeDate && (
                        <div className="flex gap-1">
                          <Select
                            id="dayOfWeek"
                            value={dayOfWeek}
                            onChange={setDayOfWeek}
                            label="День тижня"
                            options={dayjs.weekdays()}
                            error=""
                          />
                          <Select
                            id="weekOrder"
                            value={week}
                            onChange={setWeek}
                            label="Порядок у місяці"
                            options={['1', '2', '3', '4', '5']}
                            error=""
                          />
                          <Select
                            id="month"
                            value={month}
                            onChange={setMonth}
                            label="Місяць"
                            options={dayjs.months()}
                            error=""
                          />
                        </div>
                      )}
                      {!alternativeDate ? (
                        <Button
                          onClick={() => setAlternativeDate(true)}
                          type="default"
                        >
                          Немає точної дати?
                        </Button>
                      ) : (
                        <Button
                          onClick={() => setAlternativeDate(false)}
                          type="default"
                        >
                          Є точна дата?
                        </Button>
                      )} */}
                    </div>
                    <Button
                      onClick={handleGenerate}
                      className="bg-primary hover:bg-blue-600 hover:text-primary text-white font-medium py-3 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
                    >
                      Почати генерацію
                    </Button>
                    <Button
                      onClick={() => router.replace("/")}
                      className="bg-border text-primary text-white font-medium py-3 rounded-xl transition-all duration-200 shadow-md shadow-lg disabled:opacity-50"
                    >
                      Назад
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <Loader />
          )}
        </>
      </Layout>
    </>
  );
}
