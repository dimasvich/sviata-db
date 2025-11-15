import { baseUrlAuth } from "@/http";

const ACCESS_KEY = 'accessToken';
const REFRESH_KEY = 'refreshToken';

export function setTokens(access: string, refresh: string) {
  const now = Date.now();
  localStorage.setItem(
    ACCESS_KEY,
    JSON.stringify({ token: access, expires: now + 15 * 60 * 1000 }),
  );
  localStorage.setItem(
    REFRESH_KEY,
    JSON.stringify({ token: refresh, expires: now + 30 * 24 * 60 * 60 * 1000 }),
  );
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

export function getToken(type: 'access' | 'refresh') {
  const key = type === 'access' ? ACCESS_KEY : REFRESH_KEY;
  const item = localStorage.getItem(key);
  if (!item) return null;

  const data = JSON.parse(item);
  if (Date.now() > data.expires) {
    localStorage.removeItem(key);
    return null;
  }

  return data.token;
}
export async function getValidAccessToken() {
  const access = getToken('access');
  if (access) return access;

  const refresh = getToken('refresh');
  if (!refresh) {
    clearTokens();
    return null;
  }

  try {
    const res = await fetch(`${baseUrlAuth}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken: refresh }),
    });

    if (!res.ok) {
      clearTokens();
      return null;
    }

    const data = await res.json();
    setTokens(data.accessToken, data.refreshToken);

    return data.accessToken;
  } catch (err) {
    console.error('Не вдалося оновити access token', err);
    clearTokens();
    return null;
  }
}
