'use client';

import AutoSearch from '@/components/ui/AutoSearch';
import Button from '@/components/ui/Button';
import CheckBox from '@/components/ui/CheckBox';
import ChooseDate from '@/components/ui/ChooseDate/ChooseDate';
import DefaultTextEditor from '@/components/ui/editor/DefaultTextEditor';
import ListOnlyEditor from '@/components/ui/editor/ListOnlyEditor';
import SeoTextEditor from '@/components/ui/editor/SeoTextEditor';
import FaqBlock from '@/components/ui/FAQ/FaqBlock';
import HeaderEditSviato from '@/components/ui/Header/HeaderEditSviato';
import EditableTimeline from '@/components/ui/HistoryBlock/HistoryBlock';
import ImageUpload from '@/components/ui/ImageUpload';
import Input from '@/components/ui/Input';
import Layout from '@/components/ui/Layout';
import Loader from '@/components/ui/Loader';
import MoreGallery from '@/components/ui/MoreGallery';
import Select from '@/components/ui/Select';
import EditableStringList from '@/components/ui/StringList/StringList';
import SviatoDeleteModal from '@/components/ui/sviato/SviatoDeleteModal';
import Textarea from '@/components/ui/Textarea';
import Typography from '@/components/ui/Typography';
import { baseUrl } from '@/http';
import { deleteSviato } from '@/http/crud';
import { Celebrate } from '@/types';
import dayjs from 'dayjs';
import 'dayjs/locale/uk';
import localeData from 'dayjs/plugin/localeData';
import Head from 'next/head';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

dayjs.locale('uk');
dayjs.extend(localeData);

export default function AddInfo() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [alternativeDate, setAlternativeDate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sviato, setSviato] = useState({
    title: '',
    description: '',
    name: '',
    teaser: '',
    status: '',
    mainImage: '',
    faq: [] as {
      question: string;
      answer: string;
    }[],
    checkedAlternative: false,
    tags: [] as string[],
    sources: [] as {
      title: string;
      link: string;
    }[],
    timeline: [] as {
      year: string;
      html: string;
    }[],
    related: [] as string[],
    moreIdeas: [] as string[],
    greetings: [] as string[],
    ideas: [] as string[],
    facts: [] as string[],
    celebrate: {} as Celebrate,
    articleId: null,
    seoText: null,
    type: '',
    date: '',
    leaflets: [] as string[],
  });
  const [newTag, setNewTag] = useState('');

  const [celebrateWhen, setCelebrateWhen] = useState('');
  const [celebrateDate, setCelebrateDate] = useState('');
  const [celebrateDayoff, setCelebrateDayoff] = useState('');

  const [selectedRule1, setSelectedRule1] = useState(
    'Що можна робити сьогоді?',
  );
  const [selectedRule2, setSelectedRule2] = useState(
    'Що не можна робити сьогоді?',
  );
  const [html1, setHtml1] = useState('');
  const [html2, setHtml2] = useState('');
  const [rule1Id, setRule1Id] = useState('');
  const [rule2Id, setRule2Id] = useState('');
  const router = useRouter();
  const [isOpenModal, setIsOpenModal] = useState(false);

  const [newSourceTitle, setNewSourceTitle] = useState('');
  const [newSourceLink, setNewSourceLink] = useState('');

  const [tags, setTags] = useState([]);

  const [mainFile, setMainFile] = useState<File | null>(null);

  const [mainImageUrl, setMainImageUrl] = useState<string | null>(null);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [leaflets, setLeaflets] = useState<File[]>([]);
  const [search, setSearch] = useState('');
  const [searchList, setSearchList] = useState<
    { _id: string; name: string; articleId: string }[]
  >([]);

  const [filled, setFilled] = useState<boolean>(false);

  const selectRelated = (item: {
    _id: string;
    name: string;
    articleId: string;
  }) => {
    setSviato((prev) => ({
      ...prev,
      related: [...prev.related, item.articleId],
    }));
    setSearch('');
    setSearchList([]);
  };

  useEffect(() => {
    if (!search.length) return;
    const fetchData = async () => {
      const res = await fetch(`${baseUrl}/api/crud/search?query=${search}`);
      if (!res.ok) return;
      const json = await res.json();
      setSearchList(json);
    };
    fetchData();
  }, [search]);

  const handleUpload = async () => {
    if (!id) return;
    setLoading(true);
    try {
      if (!sviato.articleId) {
        const res = await fetch(`${baseUrl}/api/build/${id}`, {
          method: 'Post',
          headers: { 'Content-Type': 'application/json' },
        });
        if (res.status == 201) alert('Зміни вивантажено');
      } else {
        const res = await fetch(`${baseUrl}/api/build/update/${id}`, {
          method: 'Post',
          headers: { 'Content-Type': 'application/json' },
        });
        if (res.status == 201) alert('Зміни вивантажено');
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (sviato.mainImage) {
      setMainImageUrl(`${baseUrl}/uploads/${id}/main/${sviato.mainImage}`);
    }
  }, [sviato]);
  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${baseUrl}/api/crud/${id}`);
        const resTags = await fetch(`${baseUrl}/api/crud/tags`);
        if (!res.ok) {
          alert('Не вдалося завантажити дані');
          return;
        }
        const json = await res.json();
        const jsonTags = await resTags.json();
        setTags(jsonTags);
        setSviato({
          ...json,
          omens: json.omens || [],
          sources: json.sources || [],
        });
        setAlternativeDate(json.checkedAlternative);
        setFilled(json.status === 'FILLED' ? true : false);
        const rulesRes = await fetch(`${baseUrl}/api/day-rules/${json.date}`);
        const jsonRules = (await rulesRes.json()) || [];
        setSelectedRule1(jsonRules[0].title || 'Що можна робити сьогоді?');
        setSelectedRule2(jsonRules[1].title || 'Що не можна робити сьогоді?');
        setHtml1(jsonRules[0].html);
        setHtml2(jsonRules[1].html);
        setRule1Id(jsonRules[0]._id);
        setRule2Id(jsonRules[1]._id);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    handleChange('checkedAlternative', alternativeDate);
  }, [alternativeDate]);

  const onDelete = async () => {
    try {
      if (!id) return;
      const res = await deleteSviato(id);
      if (res.ok) router.replace('/');
    } catch (error) {
      alert(error);
    }
  };

  const handleChange = (
    field: string,
    value: string | boolean | { question: string; answer: string },
  ) => {
    setSviato((prev) => ({ ...prev, [field]: value }));
  };

  const handleRemoveRelated = (related: string) => {
    setSviato((prev) => ({
      ...prev,
      related: prev.related.filter((t) => t !== related),
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !sviato.tags.includes(newTag.trim())) {
      setSviato((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag('');
    }
  };
  const handleRemoveTag = (tag: string) => {
    setSviato((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };
  function convertHtmlToList(html: string): string {
    if (!html) return '';

    // прибираємо порожні абзаци
    const cleaned = html.replace(/<p>\s*<\/p>/gi, '');

    // розбиваємо на рядки по <br> і </p>
    const lines = cleaned
      .split(/<br\s*\/?>|<\/p>/i)
      .map((line) =>
        line
          .replace(/<p>/gi, '') // прибираємо <p>
          .replace(/&nbsp;/g, '') // прибираємо &nbsp;
          .trim(),
      )
      .filter((line) => line.length > 0);

    // додаємо <li> до кожного рядка
    const listItems = lines.map((line) => {
      // прибираємо дефіси на початку
      line = line.replace(/^–\s*/, '');
      return `<li>${line}</li>`;
    });

    return `<ul>${listItems.join('')}</ul>`;
  }

  const handleSubmitRules = async () => {
    const requests = [];

    if (selectedRule1 && html1.trim()) {
      requests.push({
        title: selectedRule1,
        html: convertHtmlToList(html1),
        date: sviato.date,
        id: rule1Id,
      });
    }

    if (selectedRule2 && html2.trim()) {
      requests.push({
        title: selectedRule2,
        html: convertHtmlToList(html2),
        date: sviato.date,
        id: rule2Id,
      });
    }

    setLoading(true);
    try {
      for (const req of requests) {
        const method = req.id ? 'PUT' : 'POST';
        const url = req.id
          ? `${baseUrl}/api/day-rules/${req.id}`
          : `${baseUrl}/api/day-rules`;

        await fetch(url, {
          method,
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
  useEffect(() => {
    if (celebrateWhen && celebrateDate && celebrateDayoff)
      setSviato((prev) => ({
        ...prev,
        celebrate: {
          when: celebrateWhen,
          date: celebrateDate,
          isDayoff: celebrateDayoff === 'так' ? true : false,
        },
      }));
  }, [celebrateWhen, celebrateDate, celebrateDayoff]);

  const handleSubmit = async () => {
    if (!id) {
      alert('Не вказано ID свята');
      return;
    }

    setLoading(true);
    try {
      await handleSubmitRules();
      const formData = new FormData();
      formData.append(
        'sviatoData',
        JSON.stringify({
          ...sviato,
          status: filled ? 'FILLED' : sviato.status,
        }),
      );

      newFiles.forEach((file) => formData.append('images', file));
      leaflets.forEach((file) => formData.append('leaflets', file));

      if (mainFile) {
        formData.append('mainImage', mainFile);
      }
      const res = await fetch(`${baseUrl}/api/crud/${id}`, {
        method: 'PUT',
        body: formData,
      });

      if (!res.ok) {
        alert('Помилка при оновленні даних');
        return;
      }
      if (res.ok) alert('Зміни збережено');
    } catch (e) {
      console.error(e);
      alert('Помилка при відправленні запиту');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Sviato-db | Редагування свята</title>
      </Head>
      {!loading ? (
        <>
          <HeaderEditSviato>
            <Button onClick={() => router.push('/')}>Назад</Button>
            <Button onClick={handleSubmit}>
              {loading ? 'Оновлюється...' : 'Зберегти зміни'}
            </Button>
            <Button onClick={handleUpload}>Вивантажити статтю</Button>
            <Button onClick={() => setIsOpenModal(true)} type="danger">
              Видалити свято
            </Button>
          </HeaderEditSviato>
          <Layout>
            <div className="flex justify-between">
              <Typography type="title">Редагування свята</Typography>
            </div>
            <div className="flex gap-6 p-2 relative w-full">
              <div className="flex flex-col gap-6 w-1/2">
                <CheckBox
                  label={'Заповнено?'}
                  value={filled}
                  setValue={setFilled}
                />
                <ChooseDate
                  sviatoDate={sviato.date}
                  onChangeDate={(d) => handleChange('date', d)}
                  onChangeAlternative={(altData) => {
                    console.log('Вибрана альтернатива:', altData);
                  }}
                  setAlternativeDate={setAlternativeDate}
                  alternativeDate={alternativeDate}
                />
                <Input
                  id="title"
                  label="Title"
                  value={sviato.title || ''}
                  onChange={(e) => handleChange('title', e.target.value)}
                />
                <Textarea
                  id="description"
                  label="Description"
                  value={sviato.description || ''}
                  onChange={(e) => handleChange('description', e.target.value)}
                />
                <Textarea
                  id="teaser"
                  label="Короткий опис (teaser)"
                  value={sviato.teaser || ''}
                  onChange={(e) => handleChange('teaser', e.target.value)}
                />
                <div className="flex flex-col gap-2">
                  <Typography type="text">Головне зображення</Typography>
                  <ImageUpload
                    previewImg={mainImageUrl}
                    onFileSelect={(file) => setMainFile(file)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-end gap-2">
                    <Select
                      id="newTag"
                      label="Тег"
                      value={newTag}
                      onChange={(val) => setNewTag(val)}
                      options={tags}
                      error=""
                    />
                    <Button onClick={handleAddTag}>+</Button>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-1">
                    {sviato.tags.map((tag) => (
                      <div
                        key={tag}
                        className="flex items-center gap-1 bg-border text-primary px-3 py-1 rounded-full text-sm"
                      >
                        <span>{tag}</span>
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="text-red-500 hover:text-red-700"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <Input
                  id="name"
                  label="Офіційна назва свята (Н1)"
                  value={sviato.name || ''}
                  onChange={(e) => handleChange('name', e.target.value)}
                />
                <div className="flex flex-col gap-2">
                  <Typography type="text">Святкування</Typography>
                  <div className="flex gap-1">
                    <Input
                      id="celebrateWhen"
                      label="Коли святкують?"
                      placeholder="Коли святкують"
                      value={celebrateWhen}
                      onChange={(e) => setCelebrateWhen(e.target.value)}
                    />
                    <Input
                      id="celebrateHtml"
                      label="Коли започатковано?"
                      placeholder="Коли започатковано"
                      value={celebrateDate}
                      onChange={(e) => setCelebrateDate(e.target.value)}
                    />
                    <Select
                      id="celebrateDayoff"
                      value={celebrateDayoff}
                      onChange={setCelebrateDayoff}
                      label="Вихідний"
                      options={['так', 'ні']}
                      error=""
                    />
                  </div>
                </div>
                <SeoTextEditor
                  value={sviato.seoText || '<p></p>'}
                  onChange={(html) => handleChange('seoText', html)}
                  newFiles={newFiles}
                  setNewFiles={setNewFiles}
                />
              </div>
              <div className="border-l-[2px] p-2 flex flex-col gap-2 w-1/2">
                <EditableTimeline
                  timeline={sviato.timeline}
                  setTimeline={(timeline) =>
                    setSviato((prev) => ({ ...prev, timeline }))
                  }
                />
                <EditableStringList
                  items={sviato.greetings}
                  setItems={(greetings) =>
                    setSviato((prev) => ({ ...prev, greetings }))
                  }
                  label="Короткі привітання"
                />
                <EditableStringList
                  items={sviato.ideas}
                  setItems={(ideas) =>
                    setSviato((prev) => ({ ...prev, ideas }))
                  }
                  label="Цитати для інстаграму"
                />
                <div className="flex flex-col gap-2">
                  <Typography type="text">Листівки</Typography>
                  <MoreGallery
                    existingImages={sviato.leaflets.map(
                      (img) => `${baseUrl}/uploads/${id}/leaflets/${img}`,
                    )}
                    onImagesChange={setLeaflets}
                    maxImages={20}
                  />
                </div>
                <FaqBlock
                  faqs={sviato.faq}
                  setFaqs={(updatedFaqs) =>
                    setSviato((prev) => ({ ...prev, faq: updatedFaqs }))
                  }
                />

                <div className="w-full">
                  <Typography type="title">
                    Що можна і що не можна робити сьогодні
                  </Typography>
                  <div className="flex flex-col gap-2 w-full">
                    <div className="flex flex-col gap-2">
                      <Input
                        id=""
                        label="Заголовок"
                        value={selectedRule1}
                        onChange={(e) => setSelectedRule1(e.target.value)}
                      />
                      <DefaultTextEditor
                        key={html1}
                        value={html1 || ''}
                        onChange={(val) =>
                          setHtml1(val.replaceAll('<p></p>', ''))
                        }
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 w-full">
                    <div className="flex flex-col gap-2">
                      <Input
                        id=""
                        label="Заголовок"
                        value={selectedRule2}
                        onChange={(e) => setSelectedRule2(e.target.value)}
                      />
                      <DefaultTextEditor
                        key={html2}
                        value={html2 || ''}
                        onChange={(val) =>
                          setHtml2(val.replaceAll('<p></p>', ''))
                        }
                      />
                    </div>
                  </div>
                </div>
                <EditableStringList
                  items={sviato.facts}
                  setItems={(facts) =>
                    setSviato((prev) => ({ ...prev, facts }))
                  }
                  label="Цікаві факти"
                />
                <div className="flex flex-col gap-2">
                  <Typography type="text">Пов&apos;язані події</Typography>
                  <div className="flex items-end gap-2">
                    <AutoSearch
                      label="Пошук свят по H1"
                      value={search}
                      placeholder="H1 свята"
                      results={searchList}
                      onChange={(e) => setSearch(e.target.value)}
                      onSelect={(item) => selectRelated(item)}
                    />
                  </div>

                  <div className="flex flex-wrap gap-2 mt-1">
                    {sviato.related.map((related) => (
                      <div
                        key={related}
                        className="flex items-center gap-1 bg-border text-primary px-3 py-1 rounded-full text-sm"
                      >
                        <span>{related}</span>
                        <button
                          onClick={() => handleRemoveRelated(related)}
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
              </div>
            </div>
          </Layout>
        </>
      ) : (
        <Loader />
      )}
      <SviatoDeleteModal
        onDelete={onDelete}
        isOpen={isOpenModal}
        onClose={() => setIsOpenModal(false)}
      />
    </>
  );
}
