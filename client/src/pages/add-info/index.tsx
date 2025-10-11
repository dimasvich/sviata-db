'use client';

import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter, useSearchParams } from 'next/navigation';
import Layout from '@/components/ui/Layout';
import Typography from '@/components/ui/Typography';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { DayRulesEnum, SviatoType } from '@/types';
import { baseUrl } from '@/http';
import Calendar from '@/components/ui/Calendar';
import localeData from 'dayjs/plugin/localeData';
import dayjs from 'dayjs';
import { getNextThreeYearsForecast, getNthWeekdayOfMonth } from '@/utils';
import SviatoDeleteModal from '@/components/ui/sviato/SviatoDeleteModal';
import { deleteSviato } from '@/http/crud';
import Gallery from '@/components/ui/Gallery';

export default function AddInfo() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [dayOfWeek, setDayOfWeek] = useState('');
  const [week, setWeek] = useState('');
  const [month, setMonth] = useState('');
  const [alternativeDate, setAlternativeDate] = useState(false);
  dayjs.extend(localeData);
  const [loading, setLoading] = useState(false);
  const [forecastDates, setForecastDates] = useState<
    {
      date: string;
      weekday: string;
    }[]
  >([]);
  const [sviato, setSviato] = useState({
    title: '',
    description: '',
    name: '',
    teaser: '',
    tag: 'Оберіть тег',
    sources: [] as {
      title: string;
      link: string;
    }[],
    omens: [] as string[],
    seoText: '',
    type: '',
    date: '',
  });
  const [newOmen, setNewOmen] = useState('');
  const [selectedRule1, setSelectedRule1] = useState('');
  const [selectedRule2, setSelectedRule2] = useState('');
  const [html1, setHtml1] = useState('');
  const [html2, setHtml2] = useState('');
  const [rule1Id, setRule1Id] = useState('');
  const [rule2Id, setRule2Id] = useState('');
  const router = useRouter();
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [newSourceTitle, setNewSourceTitle] = useState('');
  const [newSourceLink, setNewSourceLink] = useState('');
  const [tags, setTags] = useState([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      const res = await fetch(`${baseUrl}/api/crud/${id}`);
      const resTags = await fetch(`${baseUrl}/api/crud/tags`);
      if (!res.ok) {
        alert('Не вдалося завантажити дані');
        return;
      }
      const json = await res.json();
      const tagsJson = await resTags.json();
      setTags(tagsJson);
      setSviato({
        ...json,
        tag: json.tag || '',
        omens: json.omens || [],
        sources: json.sources || [],
      });
      setImages(json.images || []);
      const rulesRes = await fetch(
        `${baseUrl}/api/crud/day-rules/${json.date}`,
      );
      const jsonRules = await rulesRes.json();
      setSelectedRule1(jsonRules[0].title);
      setSelectedRule2(jsonRules[1].title);
      setHtml1(jsonRules[0].html);
      setHtml2(jsonRules[1].html);
      setRule1Id(jsonRules[0]._id);
      setRule2Id(jsonRules[1]._id);
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    const forecast = getNextThreeYearsForecast(sviato.date);
    setForecastDates(forecast);
  }, [sviato.date]);
  const onDelete = async () => {
    try {
      if (!id) return;
      const res = await deleteSviato(id);
      if (res.ok) router.replace('/');
    } catch (error) {
      alert(error);
    }
  };

  const handleChange = (field: string, value: string) => {
    setSviato((prev) => ({ ...prev, [field]: value }));
  };

  const enumOptions = Object.values(DayRulesEnum);

  const handleAddOmen = () => {
    if (newOmen.trim() && !sviato.omens.includes(newOmen.trim())) {
      setSviato((prev) => ({
        ...prev,
        omens: [...prev.omens, newOmen.trim()],
      }));
      setNewOmen('');
    }
  };

  const handleRemoveOmen = (omen: string) => {
    setSviato((prev) => ({
      ...prev,
      omens: prev.omens.filter((t) => t !== omen),
    }));
  };
  const handleSubmitRules = async () => {
    const requests = [];

    if (selectedRule1 && html1.trim()) {
      requests.push({
        title: selectedRule1,
        html: html1,
        date: sviato.date,
        id: rule1Id,
      });
    }

    if (selectedRule2 && html2.trim()) {
      requests.push({
        title: selectedRule2,
        html: html2,
        date: sviato.date,
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

  const handleSubmit = async () => {
    if (!id) {
      alert('Не вказано ID свята');
      return;
    }

    setLoading(true);
    try {
      await handleSubmitRules();
      const res = await fetch(`${baseUrl}/api/crud/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sviato),
      });
      if (newFiles.length > 0) {
        const formData = new FormData();
        newFiles.forEach((f) => formData.append('images', f));
        const res = await fetch(`${baseUrl}/api/crud/sviato-images/${id}`, {
          method: 'POST',
          body: formData,
        });
        if (!res.ok) throw new Error('Помилка завантаження зображень');
        const uploaded = await res.json();
        setImages((prev) => [...prev, ...uploaded]);
        setNewFiles([]);
      }

      if (!res.ok) {
        alert('Помилка при оновленні даних');
        return;
      }

      router.replace(`/`);
    } catch (e) {
      console.error(e);
      alert('Помилка при відправленні запиту');
    } finally {
      setLoading(false);
    }
  };

  const options = Object.keys(SviatoType).filter((k) => isNaN(Number(k)));

  useEffect(() => {
    if (dayOfWeek.length && month.length && week.length) {
      const d = getNthWeekdayOfMonth({ dayOfWeek, weekOrder: week, month });
      handleChange('date', d);
    }
  }, [dayOfWeek, month, week]);

  return (
    <>
      <Head>
        <title>Sviato-db | Редагування свята</title>
      </Head>
      <Layout>
        <div className="flex flex-col gap-6 w-full max-w-3xl mx-auto">
          <div className="felx justify-between">
            <Typography type="title">Редагування свята</Typography>
            <Button onClick={() => setIsOpenModal(true)} type="danger">
              Видалити свято
            </Button>
          </div>
          {forecastDates.length > 0 && (
            <div className="mt-4">
              <Typography type="title">
                Коли святкуватимемо {sviato.title || 'це свято'} у найближчі
                роки
              </Typography>
              <ul className="list-none mt-2 text-primary">
                {forecastDates.map((d, idx) => (
                  <li key={idx}>
                    <span className="font-medium">
                      {d.date + ' ' + '(' + d.weekday + ')'}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Input
            id="title"
            label="Заголовок"
            value={sviato.title || ''}
            onChange={(e) => handleChange('title', e.target.value)}
          />

          <Input
            id="name"
            label="Назва"
            value={sviato.name || ''}
            onChange={(e) => handleChange('name', e.target.value)}
          />

          <Textarea
            id="description"
            label="Опис (HTML)"
            maxLength={1000}
            value={sviato.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
          />

          <Textarea
            id="teaser"
            label="Короткий опис (teaser)"
            value={sviato.teaser || ''}
            onChange={(e) => handleChange('teaser', e.target.value)}
          />
          <Select
            id="newTag"
            label="Тег"
            value={sviato.tag}
            options={tags}
            onChange={(value) => handleChange('tag', value)}
          />

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
              {sviato.omens.map((omen) => (
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

          <div className="flex flex-col gap-2">
            <Typography type="text">Джерела</Typography>

            <div className="flex gap-2">
              <Input
                id="newSourceTitle"
                label=""
                placeholder="Назва джерела"
                value={newSourceTitle}
                onChange={(e) => setNewSourceTitle(e.target.value)}
              />
              <Input
                id="newSourceLink"
                label=""
                placeholder="Посилання (URL)"
                value={newSourceLink}
                onChange={(e) => setNewSourceLink(e.target.value)}
              />
              <Button
                onClick={() => {
                  const title = newSourceTitle.trim();
                  const link = newSourceLink.trim();
                  if (title && link) {
                    setSviato((prev) => ({
                      ...prev,
                      sources: [...prev.sources, { title, link }],
                    }));
                    setNewSourceTitle('');
                    setNewSourceLink('');
                  }
                }}
              >
                +
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 mt-1">
              {sviato.sources.map((source, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 bg-border text-primary px-3 py-1 rounded-full text-sm"
                >
                  <a
                    href={source.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-blue-600"
                  >
                    {source.title}
                  </a>
                  <button
                    onClick={() =>
                      setSviato((prev) => ({
                        ...prev,
                        sources: prev.sources.filter((_, i) => i !== idx),
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

          <Textarea
            id="seoText"
            label="SEO текст (HTML)"
            maxLength={5000}
            value={sviato.seoText || ''}
            onChange={(e) => handleChange('seoText', e.target.value)}
          />

          <Select
            id="type"
            label="Тип свята"
            value={sviato.type || ''}
            onChange={(val) => handleChange('type', val)}
            options={options}
            error=""
          />
          <div className="flex flex-col gap-2">
            <Typography type="text">Картинки свята</Typography>
            <Gallery
              existingImages={images}
              onImagesChange={setNewFiles}
              onRemoveExisting={(img: string) =>
                setImages((prev) => prev.filter((i) => i !== img))
              }
              maxImages={10}
            />
          </div>

          <div className="flex gap-2 items-end flex-col">
            {!alternativeDate && (
              <Calendar
                id="date"
                label="Дата свята*"
                value={sviato.date}
                onChange={(d) => handleChange('date', d)}
                error={''}
              />
            )}
            {alternativeDate && (
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
              <Button onClick={() => setAlternativeDate(true)} type="default">
                Немає точної дати?
              </Button>
            ) : (
              <Button onClick={() => setAlternativeDate(false)} type="default">
                Є точна дата?
              </Button>
            )}
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
          </div>

          <Button onClick={handleSubmit}>
            {loading ? 'Оновлюється...' : 'Зберегти зміни'}
          </Button>
        </div>
      </Layout>
      <SviatoDeleteModal
        onDelete={onDelete}
        isOpen={isOpenModal}
        onClose={() => setIsOpenModal(false)}
      />
    </>
  );
}
