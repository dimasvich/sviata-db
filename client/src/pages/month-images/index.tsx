import Button from '@/components/ui/Button';
import FileUpload from '@/components/ui/FileUpload';
import Layout from '@/components/ui/Layout';
import Typography from '@/components/ui/Typography';
import Head from 'next/head';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { baseUrl } from '@/http';
import { useRouter } from 'next/navigation';
import Loader from '@/components/ui/Loader';
import Gallery from '@/components/ui/Gallery';
import MoreGallery from '@/components/ui/MoreGallery';
import MonthYearPicker from '@/components/ui/MonthYearPicker';
import { apiFetch } from '@/http/api';

export default function AutoGeneratePage() {
  const [files, setFiles] = useState<File[]>([]);
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleUpload = async () => {
    if (files.length === 0) return alert('Додайте хоча б одну картинку');

    setLoading(true);

    try {
      const formData = new FormData();
      files.forEach((file) => formData.append('images', file));

      const res = await apiFetch(`${baseUrl}/api/day/images/${date}`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Помилка при запиті: ${res.status}`);
      }

      if (res.ok) router.push('/');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Svyato-db | Зображення на місяць</title>
        <meta name="description" content="Зображення на місяць" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Layout>
        <>
          {!loading ? (
            <div className="min-h-[80vh] w-full flex items-center justify-center bg-background">
              <div className="bg-surface w-full  rounded-2xl shadow-lg p-10 border border-border">
                <div className="flex flex-col items-center text-center gap-6">
                  <Typography
                    type="title"
                    className="text-primary text-3xl font-semibold"
                  >
                    Зображення на місяць
                  </Typography>

                  <div className="flex flex-col gap-6 w-full mt-4">
                    <MonthYearPicker
                      id="date"
                      label="Оберіть дату"
                      value={date}
                      onChange={setDate}
                    />
                    <MoreGallery onImagesChange={setFiles} maxImages={100} />

                    <Button
                      onClick={handleUpload}
                      className="bg-primary hover:bg-blue-600 hover:text-primary text-white font-medium py-3 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
                    >
                      Вивантажити файли
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
