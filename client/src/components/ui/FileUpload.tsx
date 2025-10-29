import { useRef, useState } from 'react';

export default function FileUpload({
  onFileSelect,
  file,
  disabled = false,
}: {
  onFileSelect: (file: File) => void;
  file: File | null;
  disabled?: boolean;
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
      className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-primary hover:bg-blue-50/30'}
        w-full h-48 overflow-hidden relative bg-surface`}
    >
      {preview ? (
        <span className="text-secondary">{file?.name}</span>
      ) : (
        <span className="text-secondary">
          Перетягніть сюди або виберіть CSV-файл
        </span>
      )}
      <input
        type="file"
        accept=".csv,text/csv"
        ref={inputRef}
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />
    </div>
  );
}
