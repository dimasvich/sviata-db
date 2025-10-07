/* eslint-disable @typescript-eslint/no-explicit-any */
import dayjs from 'dayjs';
import { baseUrl } from '.';

export const getList = async (date: string) => {
  const res = await fetch(`${baseUrl}/api/crud/date/${date}`, {
    method: 'GET',
  });
  return res;
};
export const getOne = async (id: string) => {
  const res = await fetch(`${baseUrl}/api/crud/one/${id}`, {
    method: 'GET',
  });
  return res;
};

export async function createSviato(payload: any) {
  const res = await fetch(`${baseUrl}/api/crud`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) return { ok: false };
  return { ok: true, data: await res.json() };
}

export async function createSviatoArticle(payload: any) {
  const res = await fetch(`${baseUrl}/api/crud/add-article`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) return { ok: false };
  return { ok: true, data: await res.json() };
}

export async function updateSviatoArticle(payload: any) {
  const res = await fetch(`${baseUrl}/api/crud/update-article`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) return { ok: false };
  return { ok: true, data: await res.json() };
}

export const updateSviato = async (body: {
  id: string;
  name: string;
  seoText: string;
  timestamp: string;
}) => {
  const res = await fetch(`${baseUrl}/api/crud`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  return res;
};

export const deleteSviato = async (id: string) => {
  const res = await fetch(`${baseUrl}/api/crud/${id}`, {
    method: 'DELETE',
  });
  return res;
};
