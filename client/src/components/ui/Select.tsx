import Typography from './Typography';

export default function Select({
  id,
  label,
  value,
  onChange,
  error,
  options,
}: {
  id: string;
  label: string;
  value: string | '';
  onChange: (val: string) => void;
  error?: string;
  options: string[];
}) {
  return (
    <div className="flex flex-col gap-1 w-full">
      <label htmlFor={id} className="text-secondary">
        <Typography type="text">{label}</Typography>
      </label>

      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value as unknown as string)}
        className={`px-3 py-2 rounded-lg border text-primary bg-surface focus:outline-none focus:ring-2
          ${error ? 'border-red-500 focus:ring-red-500' : 'border-border focus:ring-primary'}`}
      >
        <option value="">Оберіть {label}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>

      {error && <span className="text-sm text-red-500">{error}</span>}
    </div>
  );
}
