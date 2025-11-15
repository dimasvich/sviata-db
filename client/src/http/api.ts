import { getValidAccessToken } from '@/utils/token';

export async function apiFetch(input: RequestInfo, init: RequestInit = {}) {
  const token = await getValidAccessToken();

  const headers = new Headers(init.headers || {});

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(input, {
    ...init,
    headers,
  });

  if (res.status === 401) {
    console.warn('Токен невалідний або прострочений');
  }

  return res;
}
