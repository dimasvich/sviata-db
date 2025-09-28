import { baseUrl } from '.';

export const getList = async (page: number) => {
  const res = await fetch(`${baseUrl}/api/crud/list/${page}`, {
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

export const createSviato = async (body: {
  name: string;
  seoText: string;
  timestamp: string;
}) => {
  const res = await fetch(`${baseUrl}/api/crud`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  return res;
};

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
