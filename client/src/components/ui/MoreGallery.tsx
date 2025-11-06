'use client';
import { baseUrl } from '@/http';
import { useEffect, useState, useRef } from 'react';
import MoreImageUpload from './MoreImageUpload';

type PreviewFile = File & { previewUrl: string };
type LeafletFile = PreviewFile | null;

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
  const [files, setFiles] = useState<LeafletFile[]>([null]);
  const [existing, setExisting] = useState<string[]>(existingImages);

  // оновлення existing при зміні пропсів
  useEffect(() => {
    if (JSON.stringify(existingImages) !== JSON.stringify(existing)) {
      setExisting(existingImages || []);
    }
  }, [existingImages, existing]);

  // очищаємо всі URL при демонтовані
  useEffect(() => {
    return () => {
      files.forEach((f) => {
        if (f) URL.revokeObjectURL(f.previewUrl);
      });
    };
  }, [files]);

  const updateFiles = (newFiles: LeafletFile[]) => {
    setFiles(newFiles);
    const realFiles = newFiles.filter((f): f is PreviewFile => f !== null);
    onImagesChange?.(realFiles.map((f) => f as File));
  };

  const handleFileSelect = (index: number, file: File) => {
    const previewFile: PreviewFile = Object.assign(file, {
      previewUrl: URL.createObjectURL(file),
    });

    const newFiles = [...files];
    newFiles[index] = previewFile;

    // додаємо null-слот, якщо ще є місце
    const totalCount = newFiles.filter(Boolean).length + existing.length;
    if (totalCount < maxImages && !newFiles.includes(null)) newFiles.push(null);

    updateFiles(newFiles);
  };

  const handleMultipleFilesSelect = (startIndex: number, selectedFiles: File[]) => {
    const newFiles = [...files];
    let insertPos = startIndex;

    selectedFiles.forEach((file) => {
      const previewFile: PreviewFile = Object.assign(file, {
        previewUrl: URL.createObjectURL(file),
      });

      while (insertPos < maxImages && newFiles[insertPos] !== null) insertPos++;
      if (insertPos >= maxImages) return;
      newFiles[insertPos] = previewFile;
      insertPos++;
    });

    // забезпечуємо null-слот, якщо ще можна додавати
    const totalCount = newFiles.filter(Boolean).length + existing.length;
    if (totalCount < maxImages && !newFiles.includes(null)) newFiles.push(null);

    updateFiles(newFiles.slice(0, maxImages));
  };

  const handleRemoveNew = (index: number) => {
    const newFiles = [...files];
    const removed = newFiles.splice(index, 1);

    // очищаємо URL тільки для існуючого файлу
    if (removed[0]) {
      URL.revokeObjectURL(removed[0].previewUrl);
    }

    // забезпечуємо null-слот
    const totalCount = newFiles.filter(Boolean).length + existing.length;
    if (totalCount < maxImages && !newFiles.includes(null)) newFiles.push(null);

    updateFiles(newFiles);
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
              src={file.previewUrl}
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
            onMultipleSelect={(files) => handleMultipleFilesSelect(idx, files)}
            disabled={files.filter(Boolean).length + existing.length >= maxImages}
          />
        )
      )}
    </div>
  );
}
