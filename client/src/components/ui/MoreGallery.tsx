// MoreGallery.tsx
import { baseUrl } from '@/http';
import { useEffect, useState } from 'react';
import MoreImageUpload from './MoreImageUpload';

type GalleryProps = {
  maxImages?: number;
  onImagesChange?: (files: File[]) => void;
  existingImages?: string[];
  onRemoveExisting?: (img: string) => void;
};

export default function MoreGallery({
  maxImages = 10,
  onImagesChange,
  existingImages = [],
  onRemoveExisting,
}: GalleryProps) {
  // масив слотів: File | null (null = слот для завантаження)
  const [files, setFiles] = useState<(File | null)[]>([null]);
  const [existing, setExisting] = useState<string[]>(existingImages);

  useEffect(() => {
    setExisting(existingImages);
  }, [existingImages]);

  // одиночне додавання у вказаний слот
  const handleFileSelect = (index: number, file: File) => {
    const newFiles = [...files];

    // якщо індекс поза поточним буфером, розширимо до цього індексу
    while (newFiles.length <= index) newFiles.push(null);

    newFiles[index] = file;

    // додати null-слот в кінець якщо треба і ще є місце
    if (newFiles.filter(Boolean).length + existing.length < maxImages) {
      if (!newFiles.includes(null)) newFiles.push(null);
    } else {
      // обрізаємо зайві null'и вкінці
      // (але не видаляємо останні файли)
      while (newFiles.length > maxImages) newFiles.pop();
    }

    setFiles(newFiles);
    onImagesChange?.(newFiles.filter(Boolean) as File[]);
  };

  // Додавання кількох файлів, починаючи з startIndex
  const handleMultipleFilesSelect = (
    startIndex: number,
    selectedFiles: File[] | FileList,
  ) => {
    const selected = Array.from(selectedFiles).slice(
      0,
      Math.max(0, maxImages - existing.length),
    );
    if (selected.length === 0) return;

    // Копія поточних слотів
    const newFiles = [...files];

    // Переконаємось, що є достатньо слотів до maxImages
    while (newFiles.length < maxImages) newFiles.push(null);

    // Знайдемо перший вільний слот, якщо startIndex зайнятий
    let insertPos = startIndex;
    // якщо insertPos > maxImages-1 — скоректуємо
    if (insertPos > maxImages - 1) insertPos = maxImages - 1;

    for (const f of selected) {
      // знайти наступний null або просто використати insertPos якщо він в межах
      while (insertPos < maxImages && newFiles[insertPos] !== null) {
        insertPos++;
      }
      if (insertPos >= maxImages) break; // немає місця
      newFiles[insertPos] = f;
      insertPos++;
    }

    // Обрізати зайві елементи (не більше maxImages)
    const trimmed = newFiles.slice(0, maxImages);

    // Переконаємось що є як мінімум один null-слот (якщо ще є місце під завантаження)
    const nonNullCount = trimmed.filter(Boolean).length + existing.length;
    const allowMore = nonNullCount < maxImages;
    if (allowMore && !trimmed.includes(null)) trimmed.push(null);

    setFiles(trimmed);
    onImagesChange?.(trimmed.filter(Boolean) as File[]);
  };

  const handleRemoveNew = (index: number) => {
    const newFiles = [...files];
    if (index >= 0 && index < newFiles.length) {
      newFiles.splice(index, 1);
    }
    // забезпечимо наявність null-слота, якщо ще можна додавати
    if (
      !newFiles.includes(null) &&
      newFiles.filter(Boolean).length + existing.length < maxImages
    ) {
      newFiles.push(null);
    }
    setFiles(newFiles);
    onImagesChange?.(newFiles.filter(Boolean) as File[]);
  };

  const handleRemoveExisting = (img: string) => {
    const updated = existing.filter((i) => i !== img);
    setExisting(updated);
    onRemoveExisting?.(img);
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {existing.map((img, idx) => (
        <div key={`existing-${idx}`} className="relative">
          <img
            src={img.startsWith('http') ? img : `${baseUrl}/uploads/${img}`}
            alt="Existing"
            className="object-contain w-full h-40 rounded-lg border border-border"
          />
          <button
            type="button"
            onClick={() => handleRemoveExisting(img)}
            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
          >
            -
          </button>
        </div>
      ))}

      {files.map((file, idx) =>
        file ? (
          <div key={`new-${idx}`} className="relative">
            <img
              src={URL.createObjectURL(file)}
              alt="Preview"
              className="object-contain w-full h-40 rounded-lg border border-border"
            />
            <button
              type="button"
              onClick={() => handleRemoveNew(idx)}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
            >
              -
            </button>
          </div>
        ) : (
          <MoreImageUpload
            key={`upload-${idx}`}
            onFileSelect={(f) => handleFileSelect(idx, f)}
            // передаємо індекс, щоб множинні файли вставлялися починаючи з цього слота
            onMultipleSelect={(files) => handleMultipleFilesSelect(idx, files)}
            disabled={
              files.filter(Boolean).length + existing.length >= maxImages
            }
          />
        ),
      )}
    </div>
  );
}
