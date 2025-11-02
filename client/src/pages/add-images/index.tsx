import Layout from '@/components/ui/Layout';
import Head from 'next/head';
import { useState } from 'react';
import Gallery from '@/components/ui/Gallery';
import { useRouter, useSearchParams } from 'next/navigation';
import { baseUrl } from '@/http';

export default function AddImages() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const handleSubmit = async () => {
    if (!id) return setError('ID свята не знайдено');
    if (files.length === 0) return setError('Додайте хоча б одну картинку');

    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));

    try {
      setLoading(true);
      setError('');
      const res = await fetch(`${baseUrl}/api/crud/images/${id}`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Помилка завантаження зображень');
      await res.json();
      setSuccess('Картинки успішно завантажені!');
      router.replace(`/add-rules?id=${id}`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Sviato-db | Додати зображення</title>
      </Head>
      <Layout>
        <div className="max-w-4xl mx-auto py-6">
          <h1 className="text-2xl font-bold mb-4">Додати зображення</h1>
          {error && <p className="text-red-500 mb-2">{error}</p>}
          {success && <p className="text-green-500 mb-2">{success}</p>}
          <Gallery onImagesChange={setFiles} maxImages={10} />
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="mt-4 px-6 py-2 bg-primary text-white rounded-lg disabled:opacity-50"
          >
            {loading ? 'Завантаження...' : 'Завантажити'}
          </button>
        </div>
      </Layout>
    </>
  );
}
