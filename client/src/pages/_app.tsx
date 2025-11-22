import { NotificationProvider } from '@/hooks/Notification';
import { baseUrl } from '@/http';
import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  // useEffect(() => {
  //   async function checkRefresh() {
  //     const refreshItem = localStorage.getItem('refreshToken');
  //     const refreshToken = refreshItem ? JSON.parse(refreshItem)?.token : null;

  //     const res = await fetch(`${baseUrl}/api/auth/check-refresh`, {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({ refreshToken }),
  //     });

  //     const data = await res.json();
  //     if (!data || typeof data.ok === 'undefined') return;

  //     if (data.reason === 'no-refresh' || data.reason === 'expired') {
  //       if (data.reason === 'no-refresh') {
  //         router.replace(`${baseUrl}/api/auth/login`);
  //         return;
  //       }

  //       if (data.reason === 'expired') {
  //         localStorage.removeItem('accessToken');
  //         localStorage.removeItem('refreshToken');
  //         router.replace(`${baseUrl}/api/auth/login`);
  //         return;
  //       }
  //     }

  //     if (data.ok) {
  //       const now = Date.now();
  //       localStorage.setItem(
  //         'accessToken',
  //         JSON.stringify({
  //           token: data.accessToken,
  //           expires: now + 15 * 60 * 1000,
  //         }),
  //       );
  //       localStorage.setItem(
  //         'refreshToken',
  //         JSON.stringify({
  //           token: data.refreshToken,
  //           expires: now + 30 * 24 * 60 * 60 * 1000,
  //         }),
  //       );
  //     }
  //   }

  //   checkRefresh();
  // }, []);

  return (
    <NotificationProvider>
      <Component {...pageProps} />
    </NotificationProvider>
  );
}
