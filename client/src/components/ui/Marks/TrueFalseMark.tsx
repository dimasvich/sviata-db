export default function TrueFalseMark({ value }: { value: boolean }) {
  return (
    <span
      className={`inline-block w-5 h-5 rounded-full text-white text-center leading-5 ${
        value ? 'bg-green-500' : 'bg-red-500'
      }`}
    >
      {value ? '✓' : '✗'}
    </span>
  );
}