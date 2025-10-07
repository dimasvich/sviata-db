import { useState } from 'react';
import ImageUpload from './ImageUpload';

export default function Gallery({
  maxImages = 10,
  onImagesChange,
}: {
  maxImages?: number;
  onImagesChange?: (files: File[]) => void;
}) {
  const [files, setFiles] = useState<(File | null)[]>([null]);

  const handleFileSelect = (index: number, file: File) => {
    const newFiles = [...files];
    newFiles[index] = file;
    // Додаємо новий слот, якщо є місце
    if (newFiles.length < maxImages && !newFiles.includes(null)) {
      newFiles.push(null);
    }
    setFiles(newFiles);
    onImagesChange?.(newFiles.filter(Boolean) as File[]);
  };

  const handleRemove = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    // Завжди залишаємо хоча б один слот
    if (!newFiles.includes(null)) newFiles.push(null);
    setFiles(newFiles);
    onImagesChange?.(newFiles.filter(Boolean) as File[]);
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {files.map((file, idx) =>
        file ? (
          <div key={idx} className="relative">
            <img
              src={URL.createObjectURL(file)}
              alt="Preview"
              className="object-contain w-full h-40 rounded-lg border border-border"
            />
            <button
              type="button"
              onClick={() => handleRemove(idx)}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
            >
              -
            </button>
          </div>
        ) : (
          <ImageUpload
            key={idx}
            onFileSelect={(f) => handleFileSelect(idx, f)}
            disabled={files.filter(Boolean).length >= maxImages}
          />
        ),
      )}
    </div>
  );
}
