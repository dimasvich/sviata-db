'use client';

import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Layout from '@/components/ui/Layout';
import Typography from '@/components/ui/Typography';
import { baseUrlAuth } from '@/http';
import Head from 'next/head';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const router = useRouter();

  const handleLogin = async () => {
    setError('');
    if (!login || !password) {
      setError('Заповніть всі поля');
      return;
    }

    try {
      const res = await fetch(`${baseUrlAuth}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login, password }),
      });

      if (!res.ok) {
        const err = await res.json();
        setError(err.message || 'Помилка логіну');
        return;
      }

      const data = await res.json(); 
      const now = Date.now();

      localStorage.setItem(
        'accessToken',
        JSON.stringify({
          token: data.accessToken,
          expires: now + 15 * 60 * 1000,
        }),
      );
      localStorage.setItem(
        'refreshToken',
        JSON.stringify({
          token: data.refreshToken,
          expires: now + 30 * 24 * 60 * 60 * 1000,
        }),
      );

      router.replace('/');
    } catch (err) {
      console.error(err);
      setError('Сталася помилка');
    }
  };

  return (
    <>
      <Head>
        <title>Sviato-db | Login</title>
      </Head>
      <Layout>
        <div className="max-w-md mx-auto mt-20 p-6 bg-surface rounded-xl shadow-lg border border-border">
          <Typography type="title">Вхід</Typography>
          <div className="flex flex-col gap-4 mt-4">
            <Input
              id="login"
              label="Логін"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
            />
            <Input
              id="password"
              label="Пароль"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <Button onClick={handleLogin}>Увійти</Button>
          </div>
        </div>
      </Layout>
    </>
  );
}
