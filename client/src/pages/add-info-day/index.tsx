'use client';

import Button from '@/components/ui/Button';
import Calendar from '@/components/ui/Calendar';
import ImageUpload from '@/components/ui/ImageUpload';
import Input from '@/components/ui/Input';
import Layout from '@/components/ui/Layout';
import Loader from '@/components/ui/Loader';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import Typography from '@/components/ui/Typography';
import DaySeoTextEditor from '@/components/ui/editor/DaySeoTextEditor';
import { baseUrl } from '@/http';
import { DayRulesEnum } from '@/types';
import { getNthWeekdayOfMonth } from '@/utils';
import Head from 'next/head';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AddInfoDay() {
  const searchParams = useSearchParams();
  const dateParam = searchParams.get('date');
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [day, setDay] = useState({
    title: '',
    description: '',
    date: '',
    dayRules: [] as { title: string; html: string; _id?: string }[],
    whoWasBornToday: [] as { title: string; html: string; image: string }[],
    omens: [] as string[],
    bornNames: [] as string[],
    images: [] as string[],
    seoText: '',
    timeline: [] as {
      year: string;
      html: string;
    }[],
  });

  const [newOmen, setNewOmen] = useState('');
  const [newName, setNewName] = useState('');
  const [selectedRule, setSelectedRule] = useState('');
  const [ruleHtml, setRuleHtml] = useState('');
  const enumOptions = Object.values(DayRulesEnum);
  const [selectedRule1, setSelectedRule1] = useState('');
  const [selectedRule2, setSelectedRule2] = useState('');
  const [html1, setHtml1] = useState('');
  const [html2, setHtml2] = useState('');
  const [rule1Id, setRule1Id] = useState('');
  const [rule2Id, setRule2Id] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState('');
  const [week, setWeek] = useState('');
  const [month, setMonth] = useState('');
  const [alternativeDate, setAlternativeDate] = useState(false);
  const [newTimeBlockYear, setNewTimeBlockYear] = useState('');
  const [newTimeBlockHtml, setNewTimeBlockHtml] = useState('');

  const [newWhoWasBornTodayTitle, setNewWhoWasBornTodayTitle] = useState('');
  const [newWhoWasBornTodayHtml, setNewWhoWasBornTodayHtml] = useState('');
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newFile, setNewFile] = useState<File | null>(null);

  useEffect(() => {
    if (newFile) setNewFiles((prev) => [...prev, newFile]);
  }, [newFile]);

  useEffect(() => {
    if (!dateParam) return;
    const fetchData = async () => {
      try {
        setDay((prev) => ({
          ...prev,
          date: dateParam,
        }));
        const res = await fetch(`${baseUrl}/api/day/${dateParam}`);
        if (!res.ok) {
          alert('Не вдалося завантажити дані по даті');
          return;
        }
        const json = await res.json();
        setDay({
          title: json.title || '',
          description: json.description || '',
          date: json.date || dateParam,
          dayRules: json.dayRules || [],
          omens: json.omens || [],
          images: json.images || [],
          seoText: json.seoText || '',
          timeline: json.timeline || [],
          whoWasBornToday: json.whoWasBornToday || [],
          bornNames: json.bornNames || [],
        });

        const rulesRes = await fetch(
          `${baseUrl}/api/crud/day-rules/${dateParam}`,
        );
        const jsonRules = await rulesRes.json();
        setSelectedRule1(jsonRules[0].title);
        setSelectedRule2(jsonRules[1].title);
        setHtml1(jsonRules[0].html);
        setHtml2(jsonRules[1].html);
        setRule1Id(jsonRules[0]._id);
        setRule2Id(jsonRules[1]._id);
      } catch (err) {
        console.error(err);
        alert('Помилка при завантаженні');
      }
    };
    fetchData();
  }, [dateParam]);

  useEffect(() => {
    if (dayOfWeek.length && month.length && week.length) {
      const d = getNthWeekdayOfMonth({ dayOfWeek, weekOrder: week, month });
      handleChange('date', d);
    }
  }, [dayOfWeek, month, week]);

  const handleChange = (field: string, value: string) => {
    setDay((prev) => ({ ...prev, [field]: value }));
  };
  const handleSubmitRules = async () => {
    const requests = [];

    if (selectedRule1 && html1.trim()) {
      requests.push({
        title: selectedRule1,
        html: html1,
        date: day.date,
        id: rule1Id,
      });
    }

    if (selectedRule2 && html2.trim()) {
      requests.push({
        title: selectedRule2,
        html: html2,
        date: day.date,
        id: rule2Id,
      });
    }

    setLoading(true);
    try {
      for (const req of requests) {
        await fetch(`${baseUrl}/api/crud/day-rules/${req.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(req),
        });
      }
    } catch (e) {
      console.error(e);
      alert('Помилка при створенні правил або прикмет');
    } finally {
      setLoading(false);
    }
  };
  const handleAddOmen = () => {
    if (newOmen.trim() && !day.omens.includes(newOmen.trim())) {
      setDay((prev) => ({ ...prev, omens: [...prev.omens, newOmen.trim()] }));
      setNewOmen('');
    }
  };
  const handleRemoveOmen = (omen: string) => {
    setDay((prev) => ({
      ...prev,
      omens: prev.omens.filter((t) => t !== omen),
    }));
  };

  const handleAddName = () => {
    if (newName.trim() && !day.bornNames.includes(newName.trim())) {
      setDay((prev) => ({
        ...prev,
        bornNames: [...prev.bornNames, newName.trim()],
      }));
      setNewName('');
    }
  };
  const handleRemoveName = (name: string) => {
    setDay((prev) => ({
      ...prev,
      bornNames: prev.bornNames.filter((t) => t !== name),
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    await handleSubmitRules();

    try {
      const formData = new FormData();
      formData.append('dayData', JSON.stringify(day));

      alert(newFiles[0]);

      // 👇 ключ має бути саме 'images'
      newFiles.forEach((file) => formData.append('images', file));

      const res = await fetch(`${baseUrl}/api/day/${day.date}`, {
        method: 'PUT',
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Помилка при оновленні даних: ${text}`);
      }

      router.push('/');
    } catch (error) {
      console.error('❌ handleSubmit error:', error);
      alert('Помилка при збереженні');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Sviato-db | Яке сьогодні свято?</title>
        <meta name="description" content="Яке сьогодні свято?" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {day ? (
        <Layout>
          <div className="flex flex-col gap-6 w-full max-w-3xl mx-auto">
            <Typography type="title">Редагування дня</Typography>

            <Textarea
              id="description"
              label="Опис (HTML)"
              maxLength={1000}
              value={day.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
            />

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Typography type="text">Історичні події</Typography>
                <Button
                  onClick={() => {
                    const year = newTimeBlockYear.trim();
                    const html = newTimeBlockHtml.trim();
                    if (year && html) {
                      setDay((prev) => ({
                        ...prev,
                        timeline: [...prev.timeline, { year, html }],
                      }));
                      setNewTimeBlockYear('');
                      setNewTimeBlockHtml('');
                    }
                  }}
                >
                  +
                </Button>
              </div>
              <div className="flex flex-col gap-2">
                <Input
                  id="newTimeBlockYear"
                  label=""
                  placeholder="Рік"
                  value={newTimeBlockYear}
                  onChange={(e) => setNewTimeBlockYear(e.target.value)}
                />
                <Textarea
                  id="newTimeBlockHtml"
                  label=""
                  maxLength={500}
                  placeholder="Текст (HTML)"
                  value={newTimeBlockHtml}
                  onChange={(e) => setNewTimeBlockHtml(e.target.value)}
                />
              </div>

              <div className="flex flex-wrap gap-2 mt-1">
                {day.timeline.map((timeblock, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 bg-border text-primary px-3 py-1 rounded-full text-sm"
                  >
                    <p>{timeblock.html}</p>
                    <button
                      onClick={() =>
                        setDay((prev) => ({
                          ...prev,
                          timeline: prev.timeline.filter((_, i) => i !== idx),
                        }))
                      }
                      className="text-red-500 hover:text-red-700"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Typography type="text">Хто народився у цей день</Typography>
                <Button
                  onClick={() => {
                    const title = newWhoWasBornTodayTitle.trim();
                    const html = newWhoWasBornTodayHtml.trim();
                    if (title && html && newFiles.length > 0) {
                      setDay((prev) => ({
                        ...prev,
                        whoWasBornToday: [
                          ...prev.whoWasBornToday,
                          ...newFiles.map((file) => ({
                            title,
                            html,
                            image: file.name,
                          })),
                        ],
                      }));
                      setNewWhoWasBornTodayTitle('');
                      setNewWhoWasBornTodayHtml('');
                      setNewFile(null);
                    }
                  }}
                >
                  +
                </Button>
              </div>

              <div className="flex flex-col gap-2">
                <Input
                  label=""
                  id="newWhoWasBornTodayTitle"
                  placeholder="Ім'я"
                  value={newWhoWasBornTodayTitle}
                  onChange={(e) => setNewWhoWasBornTodayTitle(e.target.value)}
                />
                <Textarea
                  label=""
                  id="newWhoWasBornTodayHtml"
                  maxLength={500}
                  placeholder="Текст (HTML)"
                  value={newWhoWasBornTodayHtml}
                  onChange={(e) => setNewWhoWasBornTodayHtml(e.target.value)}
                />
                <ImageUpload onFileSelect={(file) => setNewFile(file)} />

                <div className="flex flex-wrap gap-2 mt-1">
                  {newFiles.map((f, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 bg-border text-primary px-3 py-1 rounded-full text-sm"
                    >
                      <p>{f.name}</p>
                      <button
                        onClick={() =>
                          setNewFiles((prev) =>
                            prev.filter((_, idx) => idx !== i),
                          )
                        }
                        className="text-red-500 hover:text-red-700"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2 mt-1">
                  {day.whoWasBornToday.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 bg-border text-primary px-3 py-1 rounded-full text-sm"
                    >
                      <p>{item.title}</p>
                      <button
                        onClick={() =>
                          setDay((prev) => ({
                            ...prev,
                            whoWasBornToday: prev.whoWasBornToday.filter(
                              (_, i) => i !== idx,
                            ),
                          }))
                        }
                        className="text-red-500 hover:text-red-700"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Typography type="text">Іменини на цей день</Typography>
                <div className="flex items-end gap-2">
                  <Input
                    id="newName"
                    label=""
                    placeholder="Додайте ім`я"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                  />
                  <Button onClick={handleAddName}>+</Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-1">
                  {day.bornNames.map((bornName) => (
                    <div
                      key={bornName}
                      className="flex items-center gap-1 bg-border text-primary px-3 py-1 rounded-full text-sm"
                    >
                      <span>{bornName}</span>
                      <button
                        onClick={() => handleRemoveName(bornName)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 items-end flex-col">
              {!alternativeDate && (
                <Calendar
                  id="date"
                  label="Дата"
                  value={day.date}
                  onChange={(d) => handleChange('date', d)}
                  error={''}
                />
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Typography type="text">Прикмети</Typography>
              <div className="flex items-end gap-2">
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
                {day.omens.map((omen) => (
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
            <div className="w-full">
              <Typography type="title">
                Змінити правила для цієї дати
              </Typography>
              <div className="flex flex-col gap-2 w-full">
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

              <div className="flex flex-col gap-2 w-full">
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
            </div>

            <Typography type="text">SEO текст</Typography>
            <DaySeoTextEditor
              value={day.seoText}
              onChange={(html) => handleChange('seoText', html)}
            />

            <Button onClick={handleSubmit}>
              {loading ? 'Збереження...' : 'Зберегти'}
            </Button>
          </div>
        </Layout>
      ) : (
        <Loader />
      )}
    </>
  );
}
