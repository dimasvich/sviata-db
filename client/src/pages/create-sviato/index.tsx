import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import Layout from '@/components/ui/Layout';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Calendar from '@/components/ui/Calendar';
import Button from '@/components/ui/Button';
import Typography from '@/components/ui/Typography';
import { createSviato, createSviatoArticle } from '@/http/crud';
import { Article, SviatoBlock } from '@/types';

export default function CreateSviato() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [seoText, setSeoText] = useState('');
  const [date, setDate] = useState('');
  const [errors, setErrors] = useState<(string | undefined)[]>([
    undefined,
    undefined,
    undefined,
  ]);

  const [articles, setArticles] = useState<Article[]>([]);
  const [staticInputs, setStaticInputs] = useState<string[][]>([]);

  const validateSviato = () => {
    const newErrors: (string | undefined)[] = [undefined, undefined, undefined];
    if (!name.trim()) newErrors[0] = 'Name is required';
    if (!seoText.trim()) newErrors[1] = 'SEO text is required';
    if (!date.trim()) newErrors[2] = 'Date is required';
    setErrors(newErrors);
    return newErrors.every((err) => err === undefined);
  };

  const addArticle = () => {
    setArticles([...articles, { title: '', blocks: [] }]);
    setStaticInputs([...staticInputs, []]);
  };

  const updateArticleTitle = (index: number, value: string) => {
    const updated = [...articles];
    updated[index].title = value;
    setArticles(updated);
  };

  const removeArticle = (index: number) => {
    setArticles(articles.filter((_, i) => i !== index));
    setStaticInputs(staticInputs.filter((_, i) => i !== index));
  };

  const addBlock = (articleIndex: number) => {
    const updated = [...articles];
    updated[articleIndex].blocks.push({});
    setArticles(updated);
  };

  const updateBlock = (
    articleIndex: number,
    blockIndex: number,
    field: keyof SviatoBlock,
    value: string,
  ) => {
    const updated = [...articles];
    updated[articleIndex].blocks[blockIndex] = {
      ...updated[articleIndex].blocks[blockIndex],
      [field]: value || undefined,
    };
    setArticles(updated);
  };

  const removeBlock = (articleIndex: number, blockIndex: number) => {
    const updated = [...articles];
    updated[articleIndex].blocks.splice(blockIndex, 1);
    setArticles(updated);
  };

  const addStaticItem = (
    articleIndex: number,
    blockIndex: number,
    value: string,
  ) => {
    if (!value.trim()) return;
    const updated = [...articles];
    const block = updated[articleIndex].blocks[blockIndex];
    if (!block.staticList) block.staticList = [];
    block.staticList.push(value.trim());
    setArticles(updated);
  };

  const removeStaticItem = (
    articleIndex: number,
    blockIndex: number,
    itemIndex: number,
  ) => {
    const updated = [...articles];
    updated[articleIndex].blocks[blockIndex].staticList?.splice(itemIndex, 1);
    setArticles(updated);
  };

  const handleSubmit = async () => {
    if (!validateSviato()) return;
    if (articles.some((a) => !a.title.trim())) {
      alert('Всі статті повинні мати заголовок');
      return;
    }

    const res = await createSviato({ name, title, seoText, timestamp: date });
    if (!res.ok) {
      alert('Виникла помилка під час створення свята');
      return;
    }

    const sviatoId = res.data?.sviatoId;
    if (!sviatoId) {
      alert('Не отримано id свята з бекенду');
      return;
    }

    for (const art of articles) {
      const payload = {
        sviatoId,
        title: art.title,
        blocks: art.blocks.length > 0 ? art.blocks : undefined,
      };
      const resArticle = await createSviatoArticle(payload);
      if (!resArticle.ok) {
        alert(`Помилка під час збереження статті "${art.title}"`);
        return;
      }
    }

    router.replace('/');
  };

  return (
    <>
      <Head>
        <title>Sviato-db | Add Sviato</title>
      </Head>
      <Layout>
        <div className="flex flex-col gap-6 w-full">
          <Typography type="title">Додати свято до БД</Typography>

          <Input
            id="name"
            label="Назва*"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors[0]}
          />
          <Input
            id="title"
            label="Title*"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            error={errors[0]}
          />
          <Textarea
            id="seoText"
            label="SEO текст*"
            value={seoText}
            onChange={(e) => setSeoText(e.target.value)}
            error={errors[1]}
          />
          <Calendar
            id="date"
            label="Дата*"
            value={date}
            onChange={(d) => setDate(d)}
            error={errors[2]}
          />

          <div className="flex flex-col gap-4">
            <Typography type="text">Статті</Typography>
            {articles.map((article, i) => (
              <div
                key={i}
                className="border rounded-lg p-4 flex flex-col gap-4"
              >
                <Input
                  id={`article-title-${i}`}
                  label="Заголовок статті*"
                  value={article.title}
                  onChange={(e) => updateArticleTitle(i, e.target.value)}
                />

                <div>
                  <Typography type="text">Блоки</Typography>
                  {article.blocks.map((block, j) => (
                    <div
                      key={j}
                      className="border rounded-lg p-4 flex flex-col gap-2 mt-2"
                    >
                      <Input
                        id={`block-title-${i}-${j}`}
                        label="Заголовок"
                        value={block.title ?? ''}
                        onChange={(e) =>
                          updateBlock(i, j, 'title', e.target.value)
                        }
                      />
                      <Textarea
                        id={`block-description-${i}-${j}`}
                        label="Опис"
                        value={block.description ?? ''}
                        onChange={(e) =>
                          updateBlock(i, j, 'description', e.target.value)
                        }
                      />
                      <Input
                        id={`block-image-${i}-${j}`}
                        label="URL зображення"
                        value={block.image ?? ''}
                        onChange={(e) =>
                          updateBlock(i, j, 'image', e.target.value)
                        }
                      />
                      <Input
                        id={`block-alt-${i}-${j}`}
                        label="Alt текст"
                        value={block.alt ?? ''}
                        onChange={(e) =>
                          updateBlock(i, j, 'alt', e.target.value)
                        }
                      />
                      <div>
                        <Typography type="text">Static List</Typography>
                        <div className="flex gap-2 items-end">
                          <Input
                            id={`block-list-${i}-${j}`}
                            label="Новий елемент"
                            value={staticInputs[i]?.[j] || ''}
                            onChange={(e) => {
                              const newInputs = [...staticInputs];
                              if (!newInputs[i]) newInputs[i] = [];
                              newInputs[i][j] = e.target.value;
                              setStaticInputs(newInputs);
                            }}
                          />
                          <Button
                            onClick={() => {
                              addStaticItem(i, j, staticInputs[i]?.[j] || '');
                              const newInputs = [...staticInputs];
                              newInputs[i][j] = '';
                              setStaticInputs(newInputs);
                            }}
                          >
                            +
                          </Button>
                        </div>
                        {block.staticList?.map((item, k) => (
                          <div
                            key={k}
                            className="flex justify-between items-center border rounded p-2 mt-2"
                          >
                            <span>{item}</span>
                            <Button onClick={() => removeStaticItem(i, j, k)}>
                              Видалити
                            </Button>
                          </div>
                        ))}
                      </div>
                      <Button onClick={() => removeBlock(i, j)}>
                        Видалити блок
                      </Button>
                    </div>
                  ))}
                  <Button onClick={() => addBlock(i)}>Додати блок</Button>
                </div>

                <Button onClick={() => removeArticle(i)}>
                  Видалити статтю
                </Button>
              </div>
            ))}
            <Button onClick={addArticle}>Додати статтю</Button>
          </div>

          <Button onClick={handleSubmit}>Зберегти свято</Button>
        </div>
      </Layout>
    </>
  );
}
