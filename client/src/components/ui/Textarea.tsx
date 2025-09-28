import Typography from './Typography';

export default function Textarea({
  id,
  label,
  placeholder = '',
  value,
  onChange,
  error,
  rows = 4,
}: {
  id: string;
  label: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  error?: string;
  rows?: number;
}) {
  return (
    <div className="flex flex-col gap-1 w-full">
      <label htmlFor={id} className="text-secondary">
        <Typography type="text">{label}</Typography>
      </label>

      <textarea
        id={id}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        rows={rows}
        className={`px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 text-primary bg-surface resize-y
          ${error ? 'border-red-500 focus:ring-red-500' : 'border-border focus:ring-primary'}`}
      />

      {error && <span className="text-sm text-red-500">{error}</span>}
    </div>
  );
}
