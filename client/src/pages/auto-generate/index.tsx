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
import { apiFetch } from '@/http/api';

export default function AutoGeneratePage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleGenerate = async () => {
    if (!file) return;

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await apiFetch(`${baseUrl}/api/generate-from-csv/upload`, {
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
        <title>Svyato-db | Автогенерація</title>
        <meta name="description" content="Автоматична генерація CSV файлів" />
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
                    Автогенерація з CSV
                  </Typography>

                  <div className="flex flex-col gap-6 w-full mt-4">
                    <FileUpload file={file} onFileSelect={(f) => setFile(f)} />

                    <Button
                      onClick={handleGenerate}
                      className="bg-primary hover:bg-blue-600 hover:text-primary text-white font-medium py-3 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
                    >
                      Завантажити файл та почати генерацію
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
