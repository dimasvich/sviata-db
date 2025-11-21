'use client';

import AutoSearch from '@/components/ui/AutoSearch/AutoSearch';
import Button from '@/components/ui/Button';
import CheckBox from '@/components/ui/CheckBox';
import ChooseDate from '@/components/ui/ChooseDate/ChooseDate';
import DayRulesSection from '@/components/ui/DayRules/DayRulesSection';
import InlineTextEditor from '@/components/ui/editor/InlineTextEditor';
import SeoTextEditor from '@/components/ui/editor/SeoTextEditor';
import FaqBlock from '@/components/ui/FAQ/FaqBlock';
import HeaderEditSvyato from '@/components/ui/Header/HeaderEditSvyato';
import EditableTimeline from '@/components/ui/HistoryBlock/HistoryBlock';
import Input from '@/components/ui/Input';
import Layout from '@/components/ui/Layout';
import Loader from '@/components/ui/Loader';
import MoreGallery from '@/components/ui/MoreGallery';
import Select from '@/components/ui/Select';
import EditableStringList from '@/components/ui/StringList/StringList';
import SvyatoDeleteModal from '@/components/ui/Svyato/SvyatoDeleteModal';
import Textarea from '@/components/ui/Textarea';
import Typography from '@/components/ui/Typography';
import { useNotification } from '@/hooks/Notification';
import { baseUrl } from '@/http';
import { apiFetch } from '@/http/api';
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
  const notify = useNotification();
  const [alternativeDate, setAlternativeDate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [svyato, setSvyato] = useState({
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
    related: [] as { _id: string; name: string }[],
    moreIdeas: [] as string[],
    greetings: [] as string[],
    ideas: [] as string[],
    facts: [] as string[],
    celebrate: {} as Celebrate,
    articleId: null,
    seoText: null,
    type: '',
    date: '',
    dateUpdate: '',
    dateUpload: '',
    leaflets: [] as string[],
  });
  const [newTag, setNewTag] = useState('');

  const [celebrateWhen, setCelebrateWhen] = useState('');
  const [celebrateDate, setCelebrateDate] = useState('');
  const [celebrateDayoff, setCelebrateDayoff] = useState('ні');

  const router = useRouter();
  const [isOpenModal, setIsOpenModal] = useState(false);

  const [newSourceTitle, setNewSourceTitle] = useState('');
  const [newSourceLink, setNewSourceLink] = useState('');

  const [tags, setTags] = useState([]);

  const [mainFiles, setMainFiles] = useState<File[]>([]);
  const [mainExisting, setMainExisting] = useState<string[]>([]);

  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [leaflets, setLeaflets] = useState<File[]>([]);
  const [search, setSearch] = useState('');
  const [searchList, setSearchList] = useState<
    { _id: string; name: string; articleId: string }[]
  >([]);

  const [filled, setFilled] = useState<boolean>(false);

  const selectRelated = (item: { _id: string; name: string }) => {
    setSvyato((prev) => ({
      ...prev,
      related: [...prev.related, item],
    }));
    setSearch('');
    setSearchList([]);
  };

  useEffect(() => {
    if (!search.length) return;
    const fetchData = async () => {
      const res = await apiFetch(`${baseUrl}/api/crud/search?query=${search}`);
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
      if (!svyato.articleId) {
        const res = await apiFetch(`${baseUrl}/api/build/${id}`, {
          method: 'Post',
          headers: { 'Content-Type': 'application/json' },
        });
        if (res.status == 201) notify('Зміни вивантажено');
      } else {
        const res = await apiFetch(`${baseUrl}/api/build/update/${id}`, {
          method: 'Post',
          headers: { 'Content-Type': 'application/json' },
        });
        if (res.status == 201) notify('Зміни вивантажено');
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (svyato.mainImage) {
      const imgs = Array.isArray(svyato.mainImage)
        ? svyato.mainImage
        : [svyato.mainImage];
      setMainExisting(
        imgs.map((img) => `${baseUrl}/uploads/${id}/main/${img}`),
      );
    }
  }, [svyato]);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await apiFetch(`${baseUrl}/api/crud/${id}`);
        const resTags = await apiFetch(`${baseUrl}/api/crud/tags`);
        if (!res.ok) {
          notify('Не вдалося завантажити дані', true);
          return;
        }
        const json = await res.json();
        const jsonTags = await resTags.json();
        setTags(jsonTags);
        setSvyato({
          ...json,
          omens: json.omens || [],
          sources: json.sources || [],
        });
        setAlternativeDate(json.checkedAlternative);
        setFilled(json.status === 'FILLED' ? true : false);
        setCelebrateWhen(json.celebrate.when);
        setCelebrateDate(json.celebrate.date);
        setCelebrateDayoff(
          json.celebrate.isDayoff ? json.celebrate.isDayoff : 'ні',
        );
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
      notify(error as string, true);
    }
  };

  const handleChange = (
    field: string,
    value: string | boolean | { question: string; answer: string },
  ) => {
    setSvyato((prev) => ({ ...prev, [field]: value }));
  };

  const handleRemoveRelated = (related: { _id: string; name: string }) => {
    setSvyato((prev) => ({
      ...prev,
      related: prev.related.filter((t) => t.name !== related.name),
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !svyato.tags.includes(newTag.trim())) {
      setSvyato((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag('');
    }
  };
  const handleRemoveTag = (tag: string) => {
    setSvyato((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  const [handleSubmitRulesFn, setHandleSubmitRulesFn] = useState<
    () => Promise<void>
  >(async () => {});
  useEffect(() => {
    if (celebrateWhen && celebrateDate && celebrateDayoff)
      setSvyato((prev) => ({
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
      notify('Не вказано ID свята', true);
      return;
    }

    setLoading(true);
    try {
      await handleSubmitRulesFn();

      const formData = new FormData();
      formData.append(
        'svyatoData',
        JSON.stringify({
          ...svyato,
          status: filled ? 'FILLED' : svyato.status,
        }),
      );

      newFiles.forEach((file) => formData.append('images', file));
      leaflets.forEach((file) => formData.append('leaflets', file));
      mainFiles.forEach((file) => formData.append('mainImages', file));

      const res = await apiFetch(`${baseUrl}/api/crud/${id}`, {
        method: 'PUT',
        body: formData,
      });

      if (!res.ok) {
        notify('Помилка при оновленні даних', true);
        return;
      }
      if (res.ok) {
        notify('Зміни збережено');
        const json = await res.json();
        setSvyato(json);
      }
    } catch (e) {
      notify('Помилка при відправленні запиту', true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Svyato-db | Редагування свята</title>
      </Head>
      {!loading ? (
        <>
          <HeaderEditSvyato>
            <Button
              onClick={() => {
                router.push('/');
              }}
            >
              Назад
            </Button>
            <div className="flex gap-1 items-center">
              <Typography type="text">
                Останнє редагування: {svyato.dateUpdate}
              </Typography>
              <Button onClick={handleSubmit}>
                {loading ? 'Оновлюється...' : 'Зберегти зміни'}
              </Button>
            </div>
            <div className="flex gap-1 items-center">
              <Typography type="text">
                Останнє вивантаження: {svyato.dateUpload}
              </Typography>
              <Button onClick={handleUpload}>Вивантажити статтю</Button>
            </div>
            <Button onClick={() => setIsOpenModal(true)} type="danger">
              Видалити свято
            </Button>
          </HeaderEditSvyato>
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
                  sviatoDate={svyato.date}
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
                  maxLength={65}
                  value={svyato.title || ''}
                  onChange={(e) => handleChange('title', e.target.value)}
                />
                <Textarea
                  id="description"
                  label="Description"
                  value={svyato.description || ''}
                  onChange={(e) => handleChange('description', e.target.value)}
                />
                <Textarea
                  id="teaser"
                  label="Короткий опис (teaser)"
                  value={svyato.teaser || ''}
                  onChange={(e) => handleChange('teaser', e.target.value)}
                />
                <div className="flex flex-col gap-2">
                  <Typography type="text">Головні зображення</Typography>
                  <MoreGallery
                    existingImages={mainExisting}
                    onImagesChange={setMainFiles}
                    maxImages={5}
                    onRemoveExisting={(img) => {
                      setMainExisting((prev) => prev.filter((i) => i !== img));
                    }}
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
                    {svyato.tags.map((tag) => (
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
                  value={svyato.name || ''}
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
                  value={svyato.seoText || '<p></p>'}
                  onChange={(html) => handleChange('seoText', html)}
                  newFiles={newFiles}
                  setNewFiles={setNewFiles}
                />
              </div>
              <div className="border-l-[2px] p-2 flex flex-col gap-2 w-1/2">
                <EditableTimeline
                  timeline={svyato.timeline}
                  setTimeline={(timeline) =>
                    setSvyato((prev) => ({ ...prev, timeline }))
                  }
                  label = 'Таймлайн'
                />
                <EditableStringList
                  items={svyato.greetings}
                  setItems={(greetings) =>
                    setSvyato((prev) => ({ ...prev, greetings }))
                  }
                  label="Короткі привітання"
                />
                <EditableStringList
                  items={svyato.ideas}
                  setItems={(ideas) =>
                    setSvyato((prev) => ({ ...prev, ideas }))
                  }
                  label="Цитати для інстаграму"
                />
                <div className="flex flex-col gap-2">
                  <Typography type="text">Листівки</Typography>
                  <MoreGallery
                    existingImages={svyato.leaflets.map(
                      (img) => `${baseUrl}/uploads/${id}/leaflets/${img}`,
                    )}
                    onImagesChange={setLeaflets}
                    maxImages={20}
                  />
                </div>
                <FaqBlock
                  faqs={svyato.faq}
                  setFaqs={(updatedFaqs) =>
                    setSvyato((prev) => ({ ...prev, faq: updatedFaqs }))
                  }
                />

                <DayRulesSection
                  date={svyato.date}
                  baseUrl={baseUrl}
                  onInit={(fn) => setHandleSubmitRulesFn(() => fn)}
                />

                <EditableStringList
                  items={svyato.facts}
                  setItems={(facts) =>
                    setSvyato((prev) => ({ ...prev, facts }))
                  }
                  label="Цікаві факти"
                />
                <div className="flex flex-col gap-2">
                  <Typography type="text">Пов&apos;язані події</Typography>
                  <div className="flex items-end gap-2">
                    <AutoSearch
                      id={id || ''}
                      setLoader={setLoading}
                      tags={tags}
                      label="Пошук свят по H1"
                      value={search}
                      placeholder="H1 свята"
                      results={searchList}
                      onChange={(e) => setSearch(e.target.value)}
                      onSelect={(item) => selectRelated(item)}
                    />
                  </div>

                  <div className="flex flex-wrap gap-2 mt-1">
                    {svyato.related.map((related) => (
                      <div
                        key={related._id}
                        className="flex items-center gap-1 bg-border text-primary px-3 py-1 rounded-full text-sm"
                      >
                        <span>{related.name}</span>
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
                    <InlineTextEditor
                      onChange={(val) => setNewSourceTitle(val)}
                      value={newSourceTitle}
                    />
                    {/* <Input
                      id="newSourceTitle"
                      label=""
                      placeholder="Назва джерела"
                      value={newSourceTitle}
                      onChange={(e) => setNewSourceTitle(e.target.value)}
                    /> */}
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
                          setSvyato((prev) => ({
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
                    {svyato.sources.map((source, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 bg-border text-primary px-3 py-1 rounded-full text-sm"
                      >
                        <span
                          onClick={() => {
                            setNewSourceTitle(source.title);
                            setNewSourceLink(source.link);
                          }}
                        >
                          {source.title}
                        </span>
                        <button
                          onClick={() =>
                            setSvyato((prev) => ({
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
      <SvyatoDeleteModal
        onDelete={onDelete}
        isOpen={isOpenModal}
        onClose={() => setIsOpenModal(false)}
      />
    </>
  );
}
