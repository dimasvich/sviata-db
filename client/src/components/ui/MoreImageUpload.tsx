// MoreImageUpload.tsx
type ImageUploadProps = {
  onFileSelect: (file: File) => void;
  onMultipleSelect?: (files: File[]) => void;
  disabled?: boolean;
};

export default function MoreImageUpload({
  onFileSelect,
  onMultipleSelect,
  disabled,
}: ImageUploadProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const filesArray = Array.from(files);

    if (filesArray.length > 1 && onMultipleSelect) {
      onMultipleSelect(filesArray);
    } else {
      onFileSelect(filesArray[0]);
    }

    // Очищаємо input, щоб можна було знову вибрати ті самі файли
    e.target.value = '';
  };

  return (
    <label
      className={`border-dashed border-2 border-gray-300 rounded-lg flex items-center justify-center h-40 cursor-pointer hover:bg-gray-50 ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      <input
        type="file"
        multiple
        className="hidden"
        onChange={handleChange}
        disabled={disabled}
        accept="image/*"
      />
      <span className="text-gray-500 text-2xl">+</span>
    </label>
  );
}
