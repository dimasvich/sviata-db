import { baseUrlAuth } from '@/http';
import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  useEffect(() => {
    async function checkRefresh() {
      try {
        const res = await fetch(`${baseUrlAuth}/auth/check-refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            refreshToken: JSON.parse(localStorage.getItem('refreshToken') as string)?.token || '',
          }),
        });

        if (res.status === 401 || res.status === 403) {
          router.replace('/login');
        }
      } catch {
        router.replace('/login');
      }
    }

    checkRefresh();
  }, []);
  return <Component {...pageProps} />;
}
