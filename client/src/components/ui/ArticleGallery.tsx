import { useState, useEffect } from 'react';
import ImageUpload from './ImageUpload';
import { baseUrl } from '@/http';

type GalleryProps = {
  id: string;
  maxImages?: number;
  onImagesChange?: (files: File[]) => void;
  existingImages?: string[];
  onRemoveExisting?: (img: string) => void;
};

export default function ArticleGallery({
  maxImages = 10,
  onImagesChange,
  existingImages = [],
  onRemoveExisting,
  id,
}: GalleryProps) {
  const [files, setFiles] = useState<(File | null)[]>([null]);
  const [existing, setExisting] = useState<string[]>(existingImages);

  useEffect(() => {
    setExisting(existingImages);
  }, [existingImages]);

  const handleFileSelect = (index: number, file: File) => {
    const newFiles = [...files];
    newFiles[index] = file;

    if (newFiles.length < maxImages && !newFiles.includes(null)) {
      newFiles.push(null);
    }

    setFiles(newFiles);
    onImagesChange?.(newFiles.filter(Boolean) as File[]);
  };

  const handleRemoveNew = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    if (!newFiles.includes(null)) newFiles.push(null);
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
            src={
              img.startsWith('http') ? img : `${baseUrl}/uploads/${id}/${img}`
            }
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
          <ImageUpload
            key={`upload-${idx}`}
            onFileSelect={(f) => handleFileSelect(idx, f)}
            disabled={files.filter(Boolean).length >= maxImages}
          />
        ),
      )}
    </div>
  );
}
