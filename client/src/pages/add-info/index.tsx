'use client';

import AutoSearch from '@/components/ui/AutoSearch';
import Button from '@/components/ui/Button';
import CheckBox from '@/components/ui/CheckBox';
import ChooseDate from '@/components/ui/ChooseDate/ChooseDate';
import ListOnlyEditor from '@/components/ui/editor/ListOnlyEditor';
import SeoTextEditor from '@/components/ui/editor/SeoTextEditor';
import ImageUpload from '@/components/ui/ImageUpload';
import Input from '@/components/ui/Input';
import Layout from '@/components/ui/Layout';
import Loader from '@/components/ui/Loader';
import MoreGallery from '@/components/ui/MoreGallery';
import Select from '@/components/ui/Select';
import SviatoDeleteModal from '@/components/ui/sviato/SviatoDeleteModal';
import Textarea from '@/components/ui/Textarea';
import Typography from '@/components/ui/Typography';
import { baseUrl } from '@/http';
import { deleteSviato } from '@/http/crud';
import { Celebrate, DayRulesEnum } from '@/types';
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
    mainImage: '',
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
  const [newGreeting, setNewGreeting] = useState('');
  const [newIdea, setNewIdea] = useState('');
  const [newFact, setNewFact] = useState('');
  const [newRelated, setNewRelated] = useState('');
  const [newMore, setNewMore] = useState('');
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

  const [newTimeBlockYear, setNewTimeBlockYear] = useState('');
  const [newTimeBlockHtml, setNewTimeBlockHtml] = useState('');

  const [tags, setTags] = useState([]);

  const [mainFile, setMainFile] = useState<File | null>(null);

  const [mainImageUrl, setMainImageUrl] = useState<string | null>(null);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [leaflets, setLeaflets] = useState<File[]>([]);
  const [search, setSearch] = useState('');
  const [searchList, setSearchList] = useState<
    { _id: string; name: string; articleId: string }[]
  >([]);

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
    } catch (error) {
      alert(error);
    }
  };

  const handleChange = (field: string, value: string | boolean) => {
    setSviato((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddGreeting = () => {
    if (newGreeting.trim() && !sviato.greetings.includes(newGreeting.trim())) {
      setSviato((prev) => ({
        ...prev,
        greetings: [...prev.greetings, newGreeting.trim()],
      }));
      setNewGreeting('');
    }
  };
  const handleRemoveGreeting = (greeting: string) => {
    setSviato((prev) => ({
      ...prev,
      greetings: prev.greetings.filter((t) => t !== greeting),
    }));
  };

  const handleAddIdea = () => {
    if (newIdea.trim() && !sviato.ideas.includes(newIdea.trim())) {
      setSviato((prev) => ({
        ...prev,
        ideas: [...prev.ideas, newIdea.trim()],
      }));
      setNewIdea('');
    }
  };
  const handleRemoveIdea = (idea: string) => {
    setSviato((prev) => ({
      ...prev,
      ideas: prev.ideas.filter((t) => t !== idea),
    }));
  };

  const handleAddFact = () => {
    if (newFact.trim() && !sviato.facts.includes(newFact.trim())) {
      setSviato((prev) => ({
        ...prev,
        facts: [...prev.facts, newFact.trim()],
      }));
      setNewFact('');
    }
  };
  const handleRemoveFact = (fact: string) => {
    setSviato((prev) => ({
      ...prev,
      facts: prev.facts.filter((t) => t !== fact),
    }));
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

  const handleSubmitRules = async () => {
    const requests = [];

    if (selectedRule1 && html1.trim()) {
      requests.push({
        title: 'Що можна робити сьогоді?',
        html: html1.replaceAll('<p></p>', ''),
        date: sviato.date,
        id: rule1Id,
      });
    }

    if (selectedRule2 && html2.trim()) {
      requests.push({
        title: 'Що не можна робити сьогоді?',
        html: html2.replaceAll('<p></p>', ''),
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
      formData.append('sviatoData', JSON.stringify(sviato));

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
        <Layout>
          <div className="flex justify-between">
            <Typography type="title">Редагування свята</Typography>

            <Button onClick={() => setIsOpenModal(true)} type="danger">
              Видалити свято
            </Button>
          </div>
          <div className="flex gap-6 p-2 relative w-full">
            <div className="flex flex-col gap-6 w-1/2">
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
              {sviato.seoText ? (
                <SeoTextEditor
                  value={sviato.seoText || ''}
                  onChange={(html) => handleChange('seoText', html)}
                  newFiles={newFiles}
                  setNewFiles={setNewFiles}
                />
              ) : (
                ''
              )}
              {/* <Textarea
            id="seoText"
            label="SEO текст (HTML)"
            maxLength={100000}
            value={sviato.seoText || ''}
            onChange={(e) => handleChange('seoText', e.target.value)}
          /> */}

              <Button onClick={handleSubmit}>
                {loading ? 'Оновлюється...' : 'Зберегти зміни'}
              </Button>
              <Button onClick={handleUpload}>Вивантажити статтю</Button>
              <Button onClick={() => router.push('/')}>Назад</Button>
            </div>
            <div className="border-l-[2px] p-2 flex flex-col gap-2 w-1/2">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Typography type="text">Timeline</Typography>
                  <Button
                    onClick={() => {
                      const year = newTimeBlockYear.trim();
                      const html = newTimeBlockHtml.trim();
                      if (year && html) {
                        setSviato((prev) => ({
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
                  {sviato.timeline.map((timeblock, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 bg-border text-primary px-3 py-1 rounded-full text-sm"
                    >
                      <p>{timeblock.html}</p>
                      <button
                        onClick={() =>
                          setSviato((prev) => ({
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
                <Typography type="text">Короткі привітання</Typography>
                <div className="flex items-end gap-2">
                  <Input
                    id="newGreeting"
                    label=""
                    placeholder="Додайте привітання"
                    value={newGreeting}
                    onChange={(e) => setNewGreeting(e.target.value)}
                  />
                  <Button onClick={handleAddGreeting}>+</Button>
                </div>

                <div className="flex flex-wrap gap-2 mt-1">
                  {sviato.greetings.map((greeting) => (
                    <div
                      key={greeting}
                      className="flex items-center gap-1 bg-border text-primary px-3 py-1 rounded-full text-sm"
                    >
                      <span>{greeting}</span>
                      <button
                        onClick={() => handleRemoveGreeting(greeting)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Typography type="text">Цитати для інстаграму</Typography>
                <div className="flex items-end gap-2">
                  <Input
                    id="newIdea"
                    label=""
                    placeholder="Додайте ідею"
                    value={newIdea}
                    onChange={(e) => setNewIdea(e.target.value)}
                  />
                  <Button onClick={handleAddIdea}>+</Button>
                </div>

                <div className="flex flex-wrap gap-2 mt-1">
                  {sviato.ideas.map((idea) => (
                    <div
                      key={idea}
                      className="flex items-center gap-1 bg-border text-primary px-3 py-1 rounded-full text-sm"
                    >
                      <span>{idea}</span>
                      <button
                        onClick={() => handleRemoveIdea(idea)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              {/* <div className="flex flex-col gap-2">
                <Typography type="text">Більше ідей для привітання</Typography>
                <div className="flex items-end gap-2">
                  <Input
                    id="newMore"
                    label=""
                    placeholder="Додайте id"
                    value={newMore}
                    onChange={(e) => setNewMore(e.target.value)}
                  />
                  <Button onClick={handleAddMore}>+</Button>
                </div>

                <div className="flex flex-wrap gap-2 mt-1">
                  {sviato.moreIdeas.map((more) => (
                    <div
                      key={more}
                      className="flex items-center gap-1 bg-border text-primary px-3 py-1 rounded-full text-sm"
                    >
                      <span>{more}</span>
                      <button
                        onClick={() => handleRemoveMore(more)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div> */}
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
              <div className="w-full">
                <Typography type="title">
                  Що можна і що не можна робити сьогодні
                </Typography>
                <div className="flex flex-col gap-2 w-full">
                  <div className="flex flex-col gap-2">
                    <Typography type="text">
                      Що можна робити{' '}
                      {dayjs(sviato.date).locale('uk').format('D MMMM')}
                    </Typography>
                    <ListOnlyEditor
                      value={html1 || ''}
                      onChange={(val) =>
                        setHtml1(val.replaceAll('<p></p>', ''))
                      }
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2 w-full">
                  <div className="flex flex-col gap-2">
                    <Typography type="text">
                      Що не можна робити{' '}
                      {dayjs(sviato.date).locale('uk').format('D MMMM')}
                    </Typography>
                    <ListOnlyEditor
                      value={html2 || ''}
                      onChange={(val) =>
                        setHtml2(val.replaceAll('<p></p>', ''))
                      }
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Typography type="text">Цікаві факти</Typography>
                <div className="flex items-start gap-2">
                  <Textarea
                    id="newFact"
                    label=""
                    maxLength={1000}
                    placeholder="Додайте факт"
                    value={newFact}
                    onChange={(e) => setNewFact(e.target.value)}
                  />
                  <Button onClick={handleAddFact}>+</Button>
                </div>

                <div className="flex flex-wrap gap-2 mt-1">
                  {sviato.facts.map((fact) => (
                    <div
                      key={fact}
                      className="flex items-center gap-1 bg-border text-primary px-3 py-1 rounded-full text-sm"
                    >
                      <span>{fact}</span>
                      <button
                        onClick={() => handleRemoveFact(fact)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
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
