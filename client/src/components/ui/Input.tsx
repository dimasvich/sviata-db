import Typography from './Typography';

export default function Input({
  id,
  label,
  type = 'text',
  placeholder = '',
  value,
  onChange,
  onBlur,
  error,
}: {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  error?: string;
}) {
  return (
    <div className="flex flex-col gap-1 w-full">
      <label htmlFor={id} className="text-secondary">
        <Typography type="text">{label}</Typography>
      </label>

      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        className={`px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 text-primary bg-surface
          ${error ? 'border-red-500 focus:ring-red-500' : 'border-border focus:ring-primary'}`}
      />

      {error && <span className="text-sm text-red-500">{error}</span>}
    </div>
  );
}
