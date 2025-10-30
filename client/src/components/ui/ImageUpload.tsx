import { useRef, useState } from 'react';

export default function ImageUpload({
  onFileSelect,
  disabled = false,
  previewImg,
}: {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
  previewImg?: string | null;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      onFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (disabled) return;
    const file = e.dataTransfer.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      onFileSelect(file);
    }
  };

  return (
    <div
      onClick={() => !disabled && inputRef.current?.click()}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className={`flex items-center justify-center border-2 border-dashed rounded-lg p-4 cursor-pointer
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary'}
        w-full h-40 overflow-hidden relative bg-surface`}
    >
      {preview ? (
        <img
          src={preview}
          alt="Preview"
          className="object-contain h-full w-full"
        />
      ) : (
        <>
          {previewImg ? (
            <img
              src={previewImg}
              alt="Preview"
              className="object-contain h-full w-full"
            />
          ) : (
            <span className="text-secondary text-center">
              Виберіть зображення
            </span>
          )}
        </>
      )}
      <input
        type="file"
        accept="image/*"
        ref={inputRef}
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />
    </div>
  );
}
