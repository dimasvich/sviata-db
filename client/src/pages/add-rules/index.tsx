'use client';

import { useEffect, useState } from 'react';
import Head from 'next/head';
import Layout from '@/components/ui/Layout';
import Typography from '@/components/ui/Typography';
import Select from '@/components/ui/Select';
import Input from '@/components/ui/Input';
import Calendar from '@/components/ui/Calendar';
import Button from '@/components/ui/Button';
import { DayRulesEnum } from '@/types';
import { baseUrl } from '@/http';
import dayjs from 'dayjs';
import localeData from 'dayjs/plugin/localeData';
import { getNthWeekdayOfMonth } from '@/utils';
import Textarea from '@/components/ui/Textarea';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiFetch } from '@/http/api';

export default function AddRules() {
  const [selectedRule1, setSelectedRule1] = useState('');
  const [selectedRule2, setSelectedRule2] = useState('');
  const [html1, setHtml1] = useState('');
  const [html2, setHtml2] = useState('');
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [alternativeDate, setAlternativeDate] = useState(false);
  const [dayOfWeek, setDayOfWeek] = useState('');
  const [week, setWeek] = useState('');
  const [month, setMonth] = useState('');
  const [omens, setOmens] = useState<string[]>([]);
  const [newOmen, setNewOmen] = useState('');

  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const router = useRouter();

  dayjs.extend(localeData);

  const enumOptions = Object.values(DayRulesEnum);

  const handleAddOmen = () => {
    if (newOmen.trim() && !omens.includes(newOmen.trim())) {
      setOmens((prev) => [...prev, newOmen.trim()]);
      setNewOmen('');
    }
  };

  const handleRemoveOmen = (omen: string) => {
    setOmens((prev) => prev.filter((o) => o !== omen));
  };

  useEffect(() => {
    if (dayOfWeek.length && month.length && week.length) {
      const d = getNthWeekdayOfMonth({ dayOfWeek, weekOrder: week, month });
      setDate(d);
    }
  }, [dayOfWeek, month, week]);

  const handleSubmit = async () => {
    if (!date || (!selectedRule1 && !selectedRule2)) {
      alert('Будь ласка, заповніть усі обовʼязкові поля');
      return;
    }

    const requests = [];

    if (selectedRule1 && html1.trim()) {
      requests.push({
        title: selectedRule1,
        html: html1,
        date,
      });
    }

    if (selectedRule2 && html2.trim()) {
      requests.push({
        title: selectedRule2,
        html: html2,
        date,
      });
    }

    setLoading(true);
    try {
      for (const req of requests) {
        await apiFetch(`${baseUrl}/api/crud/day-rules`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(req),
        });
      }

      if (omens.length && id) {
        await apiFetch(`${baseUrl}/api/crud/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ omens }),
        });
      }

      router.replace(`/add-info?id=${id}`);
    } catch (e) {
      console.error(e);
      alert('Помилка при створенні правил або прикмет');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Svyato-db | Додати правила дня</title>
      </Head>

      <Layout>
        <div className="flex flex-col gap-6 w-full max-w-xl mx-auto">
          <Typography type="title">Додати правила дня</Typography>

          <div className="flex flex-col gap-2">
            <Select
              id="rule1"
              label="Перше правило"
              value={selectedRule1}
              onChange={setSelectedRule1}
              options={enumOptions}
              error=""
            />

            <Textarea
              id="html1"
              label="HTML контент для першого правила"
              placeholder="Введіть HTML..."
              value={html1}
              maxLength={1000}
              onChange={(e) => setHtml1(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Select
              id="rule2"
              label="Друге правило"
              value={selectedRule2}
              onChange={setSelectedRule2}
              options={enumOptions}
              error=""
            />

            <Textarea
              id="html2"
              label="HTML контент для другого правила"
              placeholder="Введіть HTML..."
              value={html2}
              maxLength={1000}
              onChange={(e) => setHtml2(e.target.value)}
            />
          </div>

          {/* --- Прикмети --- */}
          <div className="flex flex-col gap-2">
            <Typography type="text">Прикмети</Typography>
            <div className="flex gap-2">
              <Input
                id="newOmen"
                label=""
                placeholder="Додайте прикмету"
                value={newOmen}
                onChange={(e) => setNewOmen(e.target.value)}
              />
              <Button onClick={handleAddOmen}>+</Button>
            </div>

            <div className="flex flex-wrap gap-2 mt-1">
              {omens.map((omen) => (
                <div
                  key={omen}
                  className="flex items-center gap-1 bg-border text-primary px-3 py-1 rounded-full text-sm"
                >
                  <span>{omen}</span>
                  <button
                    onClick={() => handleRemoveOmen(omen)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2 items-end flex-col">
            {!alternativeDate && (
              <Calendar
                id="date"
                label="Дата свята*"
                value={date}
                onChange={(d) => setDate(d)}
                error={''}
              />
            )}
            {alternativeDate && (
              <div className="flex flex-col gap-1 ">
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
              <Button onClick={() => setAlternativeDate(true)} type="default">
                Немає точної дати?
              </Button>
            ) : (
              <Button onClick={() => setAlternativeDate(false)} type="default">
                Є точна дата?
              </Button>
            )}
          </div>

          <Button onClick={handleSubmit}>
            {loading ? 'Створюється...' : 'Створити'}
          </Button>
        </div>
      </Layout>
    </>
  );
}
