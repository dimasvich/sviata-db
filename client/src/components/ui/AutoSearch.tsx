'use client';
import { baseUrl } from '@/http';
import { useEffect, useState } from 'react';
import ModalDoesntExist from './ModalDoesntExist/ModalDoesntExist';
import ModalAddHoliday from './ModalDoesntExist/ModalDoesntExistGenerate';
import Typography from './Typography';

interface SearchItem {
  _id: string;
  name: string;
}

interface AutoSearchProps {
  id: string;
  label: string;
  placeholder?: string;
  value: string;
  results: SearchItem[];
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelect: (item: SearchItem) => void;
  setLoader: (s: boolean) => void;
  error?: string;
  tags: string[];
}

export default function AutoSearch({
  label,
  placeholder = '',
  value,
  results,
  onChange,
  onSelect,
  error,
  tags,
  setLoader,
  id,
}: AutoSearchProps) {
  const [focused, setFocused] = useState(false);

  const showResults = focused;

  const [modalOpen, setModalOpen] = useState(false);
  const [modalOpenGenerate, setModalOpenGenerate] = useState(false);
  const [sviatoId, setSviatoId] = useState<string | null>(null);
  const [sviatoName, setSviatoName] = useState<string | null>(null);

  const createNew = async (sviatoName: string) => {
    if (!sviatoName) return;
    const res = await fetch(`${baseUrl}/api/crud`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: sviatoName, related:[id] }),
    });
    const json = await res.json();
    onSelect({ _id: json._id, name: sviatoName });
    setSviatoName(sviatoName);
    return json._id;
  };

  async function addNew() {
    const id = await createNew(value);
    if (id) setSviatoId(id);
    setModalOpen(false);
    setModalOpenGenerate(true);
  }

  async function startGeneration(data: { date: string; tags: string[] }) {
    setLoader(true);
    if (sviatoId && data) {
      const res = await fetch(
        `${baseUrl}/api/generate-from-csv/read/${sviatoId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...data, name: sviatoName }),
        },
      );
      setModalOpenGenerate(false);
      if (res.ok) alert(`Свято успішно згенеровано`);
      setSviatoName(null);
      setSviatoId(null);
    }
    setLoader(false);
  }

  function closeModal() {
    setModalOpen(false);
  }

  useEffect(() => {
    if (results.length) {
      setModalOpen(false);
    } else {
      setModalOpen(true);
    }
  }, [results]);

  return (
    <>
      <div className="relative w-full">
        <label className="text-secondary block mb-1">
          <Typography type="text">{label}</Typography>
        </label>

        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          className={`px-3 py-2 w-full rounded-lg border focus:outline-none focus:ring-2 text-primary bg-surface
          ${error ? 'border-red-500 focus:ring-red-500' : 'border-border focus:ring-primary'}`}
        />

        {error && <span className="text-sm text-red-500">{error}</span>}

        {showResults && (
          <ul className="absolute z-10 w-full bg-white border border-border rounded-lg mt-1 shadow-lg max-h-56 overflow-y-auto">
            {modalOpen ? (
              <ModalDoesntExist
                title={value}
                onConfirm={addNew}
                onCancel={closeModal}
              />
            ) : (
              results.map((item) => (
                <li
                  key={item._id}
                  onClick={() => onSelect(item)}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-primary"
                >
                  {item.name}
                </li>
              ))
            )}
          </ul>
        )}
      </div>
      {modalOpenGenerate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setModalOpenGenerate(false)}
          />

          <div className="relative z-60">
            <ModalAddHoliday
              tags={tags}
              onConfirm={(data) => startGeneration(data)}
              onCancel={() => setModalOpenGenerate(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}
